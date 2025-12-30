---
sidebar_position: 1
title: 이메일 발송 비동기 처리 (92% 개선)
---

# 이메일 발송 API 응답 속도 92% 개선

> Spring Event + @Async를 활용한 비동기 처리로 **2.5초 → 0.2초** 달성

---

## 0. 개요

:::danger 문제 상황

- JavaMailSender.send()가 **동기 블로킹 방식**
- SMTP 서버 응답 대기 시간 (평균 2~3초)
- 사용자는 이메일 발송 완료까지 대기
  :::

:::tip 해결 방향

- Spring Event를 발행하여 비동기 처리
- @Async로 별도 스레드에서 이메일 발송
- ThreadPoolTaskExecutor로 스레드 풀 관리
  :::

---

## 1. 문제 분석

### AS-IS: 동기 블로킹 방식

```java
@Service
public class VerificationService {

    public void createAndSendCode(String email, VerificationType type) {
        String code = generateRandomCode();
        redisService.saveCode(email, code, type);  // 0.1초

        // 동기 블로킹 - SMTP 서버 응답 대기
        emailService.sendVerificationCode(email, code, type);  // 2.4초

        // 총 응답 시간: 2.5초
    }
}
```

**문제점**

1. API 응답이 이메일 발송 완료까지 블로킹
2. SMTP 서버 응답이 느리면 사용자 대기 시간 증가
3. 동시 요청 시 처리량 감소

---

## 2. 해결 과정

### Step 1: Spring Event 설계

```java
// 이벤트 클래스
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

### Step 2: 이벤트 발행

```java
@Service
public class VerificationService {
    private final ApplicationEventPublisher eventPublisher;

    public void createAndSendCode(String email, VerificationType type) {
        String code = generateRandomCode();
        redisService.saveCode(email, code, type);  // Redis 저장 (동기)

        // 이벤트 발행 (비동기)
        eventPublisher.publishEvent(
            new VerificationCodeCreatedEvent(this, email, code, type)
        );

        log.info("인증코드 생성 완료: email={}", email);
        // 여기서 즉시 응답 반환 (총 0.2초)
    }
}
```

### Step 3: 이벤트 리스너 (@Async)

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
            log.info("이메일 발송 완료: email={}", event.getEmail());
        } catch (Exception e) {
            log.error("이메일 발송 실패: email={}", event.getEmail(), e);
            // 실패 시 재시도 로직 또는 알림 처리
        }
    }
}
```

### Step 4: ThreadPoolTaskExecutor 설정

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
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

---

## 3. 성능 측정

### 측정 방법

- JMeter: 동시 사용자 50명, 각 10회 요청
- API: POST /api/auth/email/verification

### 결과

| 항목                  | Before (동기) | After (비동기) | 개선율     |
| --------------------- | ------------- | -------------- | ---------- |
| **평균 응답시간**     | 2.5초         | 0.2초          | **92% ↓**  |
| **95 percentile**     | 3.2초         | 0.3초          | **90% ↓**  |
| **처리량 (TPS)**      | 10 req/s      | 100+ req/s     | **10배 ↑** |
| **동시 처리 가능 수** | 10명          | 100명+         | **10배 ↑** |

---

## 4. TO-BE 아키텍처

```
[Client 요청]
     ↓
[Controller] ← 0.2초 후 즉시 응답
     ↓
[VerificationService]
  ├─ Redis 저장 (0.1초)
  └─ Event 발행 (0.1초) ← 여기서 반환
           ↓
[ApplicationEventPublisher]
           ↓
    [emailTaskExecutor] ← 별도 스레드 풀
           ↓
[VerificationCodeEventListener]
  @Async("emailTaskExecutor")
           ↓
[EmailService.sendMail()] ← 2.4초 (사용자는 대기 안 함)
```

---

## 5. 핵심 개선 포인트

### 1️⃣ 이벤트 기반 아키텍처 (EDA)

- ✅ 이메일 발송 로직을 **별도 이벤트로 분리**
- ✅ API 응답과 이메일 발송이 **느슨하게 결합**
- ✅ 이메일 발송 실패 시에도 사용자 응답에 영향 없음

### 2️⃣ @Async 비동기 처리

- ✅ 별도 스레드에서 이메일 발송
- ✅ 메인 스레드는 즉시 반환
- ✅ 스레드 풀로 동시 요청 안정적 처리

### 3️⃣ ThreadPoolTaskExecutor 튜닝

```java
CorePoolSize: 2       // 항상 살아있는 스레드
MaxPoolSize: 5        // 부하 시 증가 가능한 최대 스레드
QueueCapacity: 100    // 대기 작업 큐 크기
```

**동작 원리**

1. 요청 2개 이하: CorePoolSize 스레드 사용
2. 요청 2~102개: 큐에 대기 (100개)
3. 요청 102개 초과: MaxPoolSize까지 스레드 증가 (최대 5개)
4. 요청 107개 초과: RejectedExecutionHandler 실행 (CallerRunsPolicy)

---

## 6. 추가 고려사항

### 이메일 발송 실패 처리

```java
@Async("emailTaskExecutor")
@EventListener
public void handleVerificationCodeCreated(VerificationCodeCreatedEvent event) {
    int maxRetries = 3;
    int retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            emailService.sendVerificationCode(
                event.getEmail(),
                event.getCode(),
                event.getType()
            );
            log.info("이메일 발송 성공: email={}", event.getEmail());
            return;
        } catch (Exception e) {
            retryCount++;
            log.warn("이메일 발송 실패 ({}회 재시도): email={}", retryCount, event.getEmail());

            if (retryCount >= maxRetries) {
                log.error("이메일 발송 최종 실패: email={}", event.getEmail(), e);
                // 슬랙 알림 또는 DB 로그 저장
            } else {
                Thread.sleep(1000 * retryCount);  // 지수 백오프
            }
        }
    }
}
```

---

## 7. 결론

:::success 성과

- API 응답 시간 **2.5초 → 0.2초** (92% 개선)
- 이메일 발송 실패 시에도 사용자 응답에 영향 없음
- 스레드 풀로 동시 발송 요청 안정적 처리
  :::

:::tip 배운 점

- **이벤트 기반 아키텍처**의 효과를 직접 체감
- **@Async의 올바른 사용법** (ThreadPoolTaskExecutor 설정)
- **비동기 처리 시 예외 처리**의 중요성
  :::

---

## 8. 참고 자료

- [Spring Framework - Event Publishing](https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html#context-functionality-events)
- [Spring Framework - Task Execution and Scheduling](https://docs.spring.io/spring-framework/reference/integration/scheduling.html)
