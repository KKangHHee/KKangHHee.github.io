---
slug: spring-event-async-email-optimization
title: "이메일 발송 API 응답 속도 개선: Spring Event와 비동기 처리"
date: 2025-12-10
categories: [Backend, Performance]
tags: []
---

# 이메일 발송 API 응답 속도 개선: Spring Event와 비동기 처리

> SMTP 동기 호출을 요청 흐름에서 분리해 인증 API 응답 시간을 **2.5초에서 0.2초로 단축**한 과정을 정리합니다.

이메일 발송은 사용자 응답에 반드시 포함될 필요가 없지만, 초기 구현에서는 SMTP 응답을 기다리는 동안 API 요청 스레드도 함께 대기했습니다. Spring Event와 `@Async`로 책임을 분리하고 실행 스레드를 관리한 과정과 남은 보완점을 살펴봅니다.

<!-- truncate -->

## 1. 문제 상황: 동기 블로킹 방식

### 초기 코드

초기에는 인증 코드 저장과 이메일 발송을 하나의 요청 흐름에서 순차적으로 처리했습니다.

```java
public class VerificationService {

    public void createAndSendCode(String email, VerificationType type) {
        // 1. 인증 코드 생성 및 Redis 저장 (0.1초)
        String code = generateRandomCode();
        redisService.saveCode(email, code, type);

        // 2. 이메일 발송 - SMTP 서버 응답 대기
        emailService.sendVerificationCode(email, code, type);
    }
}
```

**문제점**

`JavaMailSender.send()`는 동기 블로킹 방식으로 동작합니다.

1. SMTP 서버가 응답할 때까지 API 요청 스레드가 대기합니다.
2. 사용자의 응답 대기 시간이 증가합니다.
3. 동시 요청이 늘어나면 요청 처리 스레드가 빠르게 소진될 수 있습니다.
4. SMTP 서버의 지연과 장애가 인증 API까지 전파됩니다.

## 2. 핵심 개념 정리

구조를 변경하기 전에 **동기와 비동기**, **블로킹과 논블로킹**, **스레드 풀**의 역할을 구분했습니다.

### 1) 동기 vs 비동기 (제어권의 관점)

- **Sync-Blocking**: 호출한 스레드가 작업이 끝날 때까지 제어권을 잃고 대기
- **Async-NonBlocking**: 작업을 다른 스레드에 위임하고 즉시 제어권을 반환

- 시간이 걸리는 작업의 경우, **Async-NonBlocking**방식을 통해 작업을 던지고 제어권을 바로 받아야 합니다.

### 2) ThreadPool이란?

- 요청마다 새로운 스레드를 생성하면,
- 스레드 생성 비용 + 컨텍스트 스위칭 비용으로 인해 성능 저하가 발생

→ 이를 해결하기 위해 **미리 만든 스레드를 재사용하는 구조가 ThreadPool**

#### 적용 효과

1. **책임 분리**: Service는 이메일 발송 구현을 알 필요가 없습니다.
2. **확장성**: 새로운 후속 작업은 별도 리스너로 추가할 수 있습니다.
3. **장애 영향 축소**: 이메일 발송 실패가 인증 코드 생성 요청의 응답을 지연시키지 않습니다.

### 3) Event-Driven Architecture 적용

- Spring의 `ApplicationEventPublisher`를 사용하여 비즈니스 로직(인증 코드 생성)과 부가 로직(이메일 발송)을 분리합니다.
- **발행(Publish)**: Service 계층에서 `publishEvent()`로 이벤트를 발행합니다.
- **구독(Subscribe)**: `@EventListener`가 이벤트를 받아 후속 작업을 처리합니다.
- **비동기화(Async)**: 리스너에 `@Async`를 적용해 별도의 Executor가 작업을 실행하도록 합니다.

- **Before:** Service가 직접 이메일 발송
- **After:** Service는 "인증 코드 생성됨" 이벤트만 발행

## 3. 해결 과정

### 1) 이벤트 클래스

먼저 이메일 발송 작업을 시작할 이벤트를 정의합니다.

```java
public class VerificationCodeCreatedEvent extends ApplicationEvent {
    private final String email;
    private final String code;
    private final VerificationType type;

    public VerificationCodeCreatedEvent(
        Object source,
        String email,
        String code,
        VerificationType type
    ) {
        super(source);
        this.email = email;
        this.code = code;
        this.type = type;
    }

    // getters
}
```

### 2) 이벤트 발행 (Service 계층)

Service 계층은 이메일 발송 구현을 직접 알지 않고, 인증 코드가 생성되었다는 이벤트만 발행합니다.

```java
@Service
@RequiredArgsConstructor
public class VerificationService {
    private final ApplicationEventPublisher eventPublisher;
    private final RedisService redisService;

    public void createAndSendCode(String email, VerificationType type) {
        // 1. Redis에 인증 코드 저장 (동기)
        String code = generateRandomCode();
        redisService.saveCode(email, code, type);

        // 2. 이벤트 발행 (비동기)
        eventPublisher.publishEvent(
            new VerificationCodeCreatedEvent(this, email, code, type)
        );
    }
}
```

### 3) 이벤트 리스너 (비동기 처리)

`@Async`와 `ThreadPoolTaskExecutor`를 설정해 이메일 발송을 요청 스레드가 아닌 별도의 워커 스레드에서 실행합니다.

```java
@Component
public class VerificationCodeEventListener {
    private final EmailService emailService;

    @Async("emailTaskExecutor")  // 별도 스레드 풀에서 실행
    @EventListener
    public void handleVerificationCodeCreated(
        VerificationCodeCreatedEvent event
    ) {
        try {
            emailService.sendVerificationCode(
                event.getEmail(),
                event.getCode(),
                event.getType()
            );
        } catch (Exception e) {
            // 실패 시 재시도 로직 또는 알림 처리
        }
    }
}
```

### 4) ThreadPoolTaskExecutor 설정

- `CorePoolSize` (기본 스레드 수)
- `MaxPoolSize` (최대 스레드 수)
- `QueueCapacity` (대기 큐 크기)
- `RejectedExecutionHandler`:
  - 최대 스레드까지 다 쓰고 큐도 꽉 찼을 때 어떻게 할지 결정합니다.
  - `AbortPolicy` (기본값): 예외를 던지고 작업을 버립니다.
  - `CallerRunsPolicy`: 큐가 꽉 차면 이벤트를 발행한 메인 스레드가 직접 처리합니다.

- `ThreadNamePrefix`:
  - 디버깅을 위한 네이밍입니다.

```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "emailTaskExecutor")
    public Executor emailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);        // 기본 스레드 수
        executor.setMaxPoolSize(5);         // 최대 스레드 수
        executor.setQueueCapacity(100);     // 대기 큐 크기
        executor.setThreadNamePrefix("email-async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());  // 큐가 꽉 찼을 때: 호출한 스레드가 직접 실행
        executor.initialize();
        return executor;
    }
}
```

#### 스레드 풀 설정

이메일 발송은 CPU 연산보다 SMTP 서버의 I/O 대기 시간이 긴 작업입니다. 초기 단계에서는 예상 트래픽이 크지 않아 작은 풀로 시작하고, 활성 스레드 수와 큐 적재량을 관찰하며 조정하도록 구성했습니다.

#### 왜 ThreadPoolTaskExecutor를 별도로 관리해야 하는가?

스레드 풀 설정은 단순한 스레드 개수 지정이 아니라 동시 실행량과 대기 작업 수를 제한하는 자원 배분 정책입니다. 명시적인 Executor를 사용하면 애플리케이션 환경에 따라 달라질 수 있는 기본 실행기 대신 풀 크기, 큐 용량, 종료 정책을 직접 관리할 수 있습니다.

- **`SimpleAsyncTaskExecutor`의 위험성**
  - 요청마다 새로운 스레드 생성
  - 스레드 재사용 X
  - 트래픽 증가 시, **OOM**이 발생 가능

- **ThreadPool을 별도로 관리하여**
  - 메인 스레드와 워커 스레드를 구분하여, 장애 격리
  - `CorePoolSize`와 `MaxPoolSize`를 통해 알맞는 자원 할당
  - `QueueCapacity`를 통해 대기 작업을 안전하게 보관

### 5) 성능 측정

#### 측정 방법

- 테스트 환경: 로컬 Docker + Redis + Gmail SMTP / JMeter
- JMeter로 동시 사용자 50명, 각 10회 요청
- API: POST /api/auth/email/verification

| 항목                  | Before (동기) | After (비동기) | 개선율     |
| --------------------- | ------------- | -------------- | ---------- |
| **평균 응답시간**     | 2.5초         | 0.2초          | **92% ↓**  |
| **95 percentile**     | 3.2초         | 0.3초          | **90% ↓**  |
| **처리량 (TPS)**      | 10 req/s      | 100+ req/s     | **10배 ↑** |
| **동시 처리 가능 수** | 10명          | 100명+         | **10배 ↑** |

## 4. 보완점

### 1) 이벤트 발행 시, 트랜잭션 문제

```java
@Transactional
public void createAndSendCode(String email, VerificationType type) {
    String code = generateRandomCode();
    redisService.saveCode(email, code, type);  // 1) DB 저장

    eventPublisher.publishEvent(
        new VerificationCodeCreatedEvent(this, email, code, type)
    );
}
```

- 이벤트 발행 직후, 예외 발생 시 롤백
- 작업 1)이 무시되어, 코드가 없는 이메일이 발송

#### 해결책

```java
@Component
public class VerificationCodeEventListener {
    private final EmailService emailService;

    @Async("emailTaskExecutor")  // 별도 스레드 풀에서 실행
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleVerificationCodeCreated(
        VerificationCodeCreatedEvent event
    ) {
        try {
            emailService.sendVerificationCode(
                event.getEmail(),
                event.getCode(),
                event.getType()
            );
        } catch (Exception e) {
            // 실패 시 재시도 로직 또는 알림 처리
        }
    }
}
```

- `@EventListener` 대신 `@TransactionalEventListener`를 사용하면 트랜잭션 커밋 이후에 이메일 발송을 시작할 수 있습니다.
- 이를 통해 이메일이 먼저 발송된 뒤 DB 저장이 롤백되는 순서 역전 문제를 방지할 수 있습니다.

#### 주의점

- `@Async`나 `@Transactional`은 Spring AOP 기반으로 동작
- **자가 호출** 시 동작하지 않음
  - 동일 클래스 내의 메서드 호출 시,
  - 프록시 객체를 거치지 않아 `@Async`가 동작하지 않으므로,
  - 반드시 리스너 클래스를 별도의 `@Component`로 분리하여 빈 주입을 통해 호출해야 함

### 2) 재시도 로직 없음

> SMTP 서버 장애에 대한 대응이 없음

#### 해결책

일시적인 SMTP 오류에 대응하려면 재시도 횟수와 간격을 제한하고, 최종 실패를 기록하거나 알림으로 전달해야 합니다. 단순 반복문보다 Spring Retry 같은 정책 기반 재시도도 검토할 수 있습니다.

### 3) 메시지 유실 방지

현재 이벤트는 애플리케이션 메모리에만 존재하므로 이벤트 처리 전에 서버가 종료되면 유실될 수 있습니다.

#### 해결책

- RabbitMQ, Kafka 같은 메시지 브로커 사용
- Dead Letter Queue(DLQ)로 실패한 메시지 별도 관리

## 5. 정리

- 사용자 응답과 직접 관련 없는 SMTP 통신을 비동기 작업으로 분리해 응답 시간을 단축했습니다.
- 이벤트 발행과 실행 스레드 관리를 분리해 Service 계층의 책임을 단순화했습니다.
- 트랜잭션 커밋 시점, 재시도, 이벤트 유실은 별도의 운영 정책으로 보완해야 합니다.

비동기 처리는 작업을 사라지게 하는 것이 아니라 실행 시점과 책임을 분리하는 방법입니다. 응답 속도뿐 아니라 실패를 어디에서 감지하고 복구할지까지 함께 설계해야 운영 가능한 구조가 됩니다.

#### 참고 자료

- [Spring Framework - Event Publishing](https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html#context-functionality-events)
- [Spring Framework - Task Execution and Scheduling](https://docs.spring.io/spring-framework/reference/integration/scheduling.html)
