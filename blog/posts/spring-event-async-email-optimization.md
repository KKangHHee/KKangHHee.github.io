---
slug: spring-event-async-email-optimization
title: "동기·비동기와 블로킹·논블로킹 구분하기: SMTP 작업 분리 사례"
date: 2025-12-10
categories: [Backend, Performance]
tags: []
---

# 동기·비동기와 블로킹·논블로킹 구분하기

> 동기·비동기는 작업 완료를 누가 통지받는지, 블로킹·논블로킹은 호출한 스레드가 기다리는지를 설명하는 서로 다른 축입니다. 네 가지 조합을 비교하고 SMTP 작업을 요청 경로에서 분리한 사례에 적용해 봅니다.

이메일 발송은 외부 SMTP 서버의 응답을 기다리는 I/O 작업입니다. 초기 구현에서는 이 작업을 호출한 API 요청 스레드가 완료까지 기다렸습니다. 해결책을 선택하기 전에 동기와 블로킹을 같은 말처럼 사용하지 않도록 각각의 기준부터 구분했습니다.

<!-- truncate -->

## 1. 문제 상황: 동기 블로킹 방식

### 초기 코드

초기에는 인증 코드 저장과 이메일 발송을 하나의 요청 흐름에서 순차적으로 처리했습니다.

```java
public class VerificationService {

    public void createAndSendCode(String email, VerificationType type) {
        // 1. 인증 코드 생성 및 Redis 저장
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

## 2. 동기·비동기와 블로킹·논블로킹

두 구분은 같은 축이 아닙니다.

- **동기/비동기**: 작업의 완료를 호출자가 직접 확인하는지, 완료 통지를 받아 후속 처리를 하는지에 관한 구분
- **블로킹/논블로킹**: 호출한 시점에 제어권이 바로 돌아오는지, 작업이 진행되는 동안 호출 스레드가 대기하는지에 관한 구분

| 조합 | 호출 흐름 | 대표적인 형태 | 요청 처리 관점 |
| --- | --- | --- | --- |
| 동기 + 블로킹 | 호출 후 완료까지 대기 | 일반적인 `JavaMailSender.send()` 직접 호출 | 구현은 단순하지만 외부 I/O 지연이 요청에 전파됨 |
| 동기 + 논블로킹 | 호출자가 완료 여부를 반복 확인 | 폴링, `isDone()` 확인 | 스레드는 다른 일을 할 수 있지만 완료 확인 책임이 호출자에게 있음 |
| 비동기 + 블로킹 | 작업을 위임받은 워커가 블로킹 I/O 수행 | `@Async` 워커에서 SMTP 호출 | 요청 스레드는 반환하지만 워커 스레드는 SMTP 완료까지 대기 |
| 비동기 + 논블로킹 | 작업 완료 시 콜백·이벤트로 후속 처리 | 논블로킹 I/O 클라이언트와 이벤트 루프 | 적은 스레드로 많은 I/O를 다룰 수 있지만 흐름과 오류 처리가 복잡해짐 |

이 프로젝트의 `Spring Event + @Async` 방식은 **요청 스레드 기준으로는 비동기**이지만, SMTP 호출 자체는 워커 스레드에서 대기하는 **비동기 + 블로킹** 조합입니다. 따라서 이를 논블로킹 SMTP 처리라고 부를 수는 없습니다.

### 왜 비동기 분리가 필요했는가?

비동기가 항상 더 좋은 것은 아닙니다. 작업 결과가 API 응답에 반드시 필요하면 완료를 기다리는 동기 처리가 자연스럽습니다. 반면 이메일 발송처럼 요청의 핵심 상태 변경이 끝난 뒤 수행할 수 있는 후속 작업이라면, 외부 I/O 완료를 요청 스레드가 기다릴 이유가 적습니다.

이 사례에서는 다음 기준으로 메일 발송을 분리했습니다.

1. 인증 코드 생성과 저장이 요청의 핵심 작업이다.
2. SMTP 발송 완료 여부를 같은 HTTP 응답 본문에 포함할 필요가 없다.
3. 외부 SMTP 지연이 API 요청 스레드 점유 시간으로 이어지고 있었다.
4. 비동기로 전환하면 실패를 요청 응답 밖에서 기록하고 재처리할 정책이 별도로 필요하다.

### Thread Pool의 역할

`@Async`가 작업 비용을 제거하는 것은 아닙니다. SMTP를 기다리는 주체를 요청 스레드에서 워커 스레드로 옮깁니다. 따라서 워커 수와 대기 큐를 제한하지 않으면 요청이 몰릴 때 메모리와 스레드가 고갈될 수 있습니다. `ThreadPoolTaskExecutor`는 동시 실행량, 큐 용량과 거부 정책을 명시하는 자원 관리 수단입니다.

#### 적용 효과

1. **책임 분리**: Service는 이메일 발송 구현을 알 필요가 없습니다.
2. **확장성**: 새로운 후속 작업은 별도 리스너로 추가할 수 있습니다.
3. **지연 전파 축소**: 이메일 발송 지연이 인증 코드 생성 요청의 응답 시간을 직접 늘리지 않습니다.

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

        // 2. 이벤트 발행 자체는 동기이며, @Async 리스너가 별도 Executor에서 처리
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
  - 요청 처리 스레드와 SMTP 작업 스레드의 실행 자원 분리
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

- 이 수치는 SMTP 작업 시간이 사라졌다는 뜻이 아니라 HTTP 응답의 측정 범위에서 분리됐다는 의미입니다.
- 메일이 실제로 발송되기까지의 종단 간 시간, 실패율과 큐 적재량은 별도의 지표로 확인해야 합니다.

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
- 저장 작업과 이벤트 발행이 하나의 트랜잭션 자원으로 묶여 있는 경우, 저장이 롤백되어 코드가 없는 이메일이 발송될 수 있음

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
- 이를 통해 트랜잭션 자원에 저장한 값이 롤백됐는데 이메일은 먼저 발송되는 순서 역전 문제를 방지할 수 있습니다.

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

- 운영 환경에서 유실을 허용할 수 없다면 인메모리 이벤트가 요구사항에 맞는지 다시 판단해야 합니다.
- 영속 메시지 큐와 실패 메시지 보관은 트래픽과 복구 요구가 실제로 생겼을 때 검토할 선택지입니다.

## 5. 정리

- 동기·비동기와 블로킹·논블로킹은 서로 다른 기준이며, `@Async`에서 SMTP를 호출하는 구조는 비동기 + 블로킹입니다.
- 사용자 응답에 완료 결과가 필요하지 않은 SMTP 통신을 요청 처리 경로에서 분리했습니다.
- 이벤트 발행과 실행 스레드 관리를 분리해 Service 계층의 책임을 단순화했습니다.
- 트랜잭션 커밋 시점, 재시도, 이벤트 유실은 별도의 운영 정책으로 보완해야 합니다.

비동기 처리는 작업을 사라지게 하는 것이 아니라 실행 시점과 책임을 분리하는 방법입니다. 응답 속도뿐 아니라 실패를 어디에서 감지하고 복구할지까지 함께 설계해야 운영 가능한 구조가 됩니다.

#### 참고 자료

- [Spring Framework - Event Publishing](https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html#context-functionality-events)
- [Spring Framework - Task Execution and Scheduling](https://docs.spring.io/spring-framework/reference/integration/scheduling.html)
