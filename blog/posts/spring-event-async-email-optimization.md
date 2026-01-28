---
slug: spring-event-async-email-optimization
title: "이메일 발송 API 응답 속도 개선: Spring Event와 비동기 처리"
date: 2025-12-10
categories: [Backend, Performance]
tags: []
---

# 이메일 발송 API 응답 속도 개선: Spring Event와 비동기 처리

> SMTP 동기 호출로 인해 2.5초 걸리던 인증 API를 <br/>
> Spring Event와 @Async를 활용한 비동기 처리로 **응답 시간을 0.2초로 단축**하고, 처리량을 향상시킨 과정입니다.

## 1. 문제 상황(동기 블로킹 방식)

### 초기 코드

- 처음에는 **저장-발송**에만 초점을 맞춰 아래와 같은 방식으로 구현했습니다.

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

- `JavaMailSender.send()` 메서드는 Sync-Blocking방식
  1. SMTP 서버가 응답할 때까지 API 요청 스레드가 대기(블로킹)
  2. 사용자 대기 시간 증가 (UX 악화)
  3. 동시 요청 시 처리량 감소
  4. SMTP 서버 장애 시 API 전체가 영향

## 2. 핵심 개념 정리

> 해결에 앞서 필요한 **동기/비동기**, **블로킹/논블로킹**, 그리고 **ThreadPool**의 개념을 먼저 정리하겠습니다.

### 1) 동기 vs 비동기 (제어권의 관점)

- **Sync-Blocking**: 호출한 스레드가 작업이 끝날 때까지 제어권을 잃고 대기
- **Async-NonBlocking**: 작업을 다른 스레드에 위임하고 즉시 제어권을 반환

- 시간이 걸리는 작업의 경우, **Async-NonBlocking**방식을 통해 작업을 던지고 제어권을 바로 받아야 합니다.

### 2) ThreadPool이란?

- 요청마다 새로운 스레드를 생성하면,
- 스레드 생성 비용 + 컨텍스트 스위칭 비용으로 인해 성능 저하가 발생

→ 이를 해결하기 위해 **미리 만든 스레드를 재사용하는 구조가 ThreadPool**

#### 장점:

1. **느슨한 결합**: Service는 이메일을 어떻게 보내는지 몰라도 됨
2. **확장성**: 다른 작업에 대해 리스너만 하나 더 만들면 끝
3. **장애 격리**: 이메일 실패해도 코드 생성은 성공

### 3) Event-Driven Architecture 적용

- Spring의 `ApplicationEventPublisher`를 사용하여 비즈니스 로직(인증 코드 생성)과 부가 로직(이메일 발송)을 분리합니다.
- **발행(Publish):**
  > 서비스 계층에서 특정 이벤트를 `publishEvent()`를 통해 트리거 합니다.<br/>
  > 이벤트 처리 여부와 상관없이 즉시 응답을 반환합니다.
- **구독(Subscribe):**
  > `@EventListener`를 통해 특정 이벤트가 트리거 되면 이에 대한 처리를 합니다.
- **비동기화(Async):**

  > 리스너 메서드에 `@Async`를 통해 비동기 작업임을 명시하고, <br/>
  > 커스텀하여, 메인 스레드가 아닌 별도의 워커 스레드로 처리함을 명시합니다.

- **Before:** Service가 직접 이메일 발송
- **After:** Service는 "인증 코드 생성됨" 이벤트만 발행

## 3. 해결과정

### 1) 이벤트 클래스

> 우리가 처리할 작업의 트리거가 될 Event를 먼저 생성합니다.

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

> 비즈니스 작업을 처리하던 기존의 Sevice계층에서는 <br/>
> 이제 이벤트 처리에 대한 내용을 알 필요가 없습니다.<br/>
> 단지, 이벤트를 던지기만 합니다.

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

> `@Async()`어노테션에 추가로 `ThreadPoolTaskExecutor`를 설정하여 메인 스레드가 아닌 워커 스레드를 할당 합니다.

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

- CorePoolSize (기본 스레드 수)
- MaxPoolSize (최대 스레드 수)
- QueueCapacity (대기 큐 크기)
- RejectedExecutionHandler:
  - 최대 스레드까지 다 쓰고 큐도 꽉 찼을 때 어떻게 할지 결정합니다.
  - AbortPolicy (기본값): 예외를 던지고 작업을 버립니다.
  - CallerRunsPolicy: 큐가 꽉 차면 이벤트를 발행한 메인 스레드가 직접 처리합니다.

- ThreadNamePrefix:
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

#### ThreadPool 설정

    - 이메일 발송은 CPU 연산보다 SMTP 서버와의 I/O 대기 시간이 긴 작업이기 때문에
    - 스레드 수를 크게 잡지 않고 초기 설정 단계이므로 값을 최소화했습니다.

#### 왜 ThreadPoolTaskExecutor를 별도로 관리해야 하는가?

> `ThreadPool`의 설정은 단순히 몇 개의 스레드를 돌릴지의 문제가 아닌 자원의 배분에 대한 설정입니다.<br/>
> 단순히 `@Async`만 사용하고 설정을 생략하면, <br/>
> 스프링은 기본적으로 `SimpleAsyncTaskExecutor`를 사용합니다.

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

## 보완점

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

- 단순히 `@EventListener`어노테이션이 아닌,
- `@TransactionalEventListener`을 사용하여 이메일 발송이 DB 저장보다 먼저 실행되는 문제를 방지
  - 트랜잭션이 커밋된 이후에만 이벤트를 처리하기 때문

#### 주의점

- `@Async`나 `@Transactional`은 Spring AOP 기반으로 동작
- **자가 호출** 시 동작하지 않음
  - 동일 클래스 내의 메서드 호출 시,
  - 프록시 객체를 거치지 않아 `@Async`가 동작하지 않으므로,
  - 반드시 리스너 클래스를 별도의 `@Component`로 분리하여 빈 주입을 통해 호출해야 함

### 2) 재시도 로직 없음

> SMTP 서버 장애에 대한 대응이 없음

#### 해결책

`handleVerificationCodeCreated`에 반복문 + `try-catch`를 사용하여 시도횟수 및 실패횟수 카운팅 및 재시도 로직 추가 필요

### 3) 메세지 유실 방지

> 현재 구조는 메인 서버가 죽으면 이벤트가 초기화<br/>
> [이벤트 발행] → [메모리 큐] → [서버 셧다운] → 이벤트 유실

#### 해결책

- RabbitMQ, Kafka 같은 메시지 브로커 사용
- Dead Letter Queue(DLQ)로 실패한 메시지 별도 관리

#### 참고 자료

- [Spring Framework - Event Publishing](https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html#context-functionality-events)
- [Spring Framework - Task Execution and Scheduling](https://docs.spring.io/spring-framework/reference/integration/scheduling.html)
