---
slug: redis-email-verification
title: "이메일 인증에서 Redis가 강점을 갖는 이유: TTL과 원자 연산"
date: 2025-10-10
categories: [Redis, Backend, Security]
tags: []
---

# 이메일 인증에서 Redis가 강점을 갖는 이유

> "이메일 인증 코드는 왜 DB가 아닌 Redis에 저장할까?"

이메일 인증 코드는 짧은 시간 동안만 유효하고, 검증이 끝나면 즉시 제거해야 하며, 시도 횟수도 안전하게 제한해야 합니다. 이 글에서는 이러한 요구사항을 기준으로 관계형 DB와 Redis를 비교하고, TTL과 원자 연산을 적용할 때 주의할 점을 정리합니다.

<!-- truncate -->

## 1. 이메일 인증의 요구사항

#### 비즈니스 요구사항

| 항목          | 요구사항               | 이유                  |
| ------------- | ---------------------- | --------------------- |
| **빠른 응답** | 빠른 응답              | 사용자 경험 (UX)      |
| **자동 만료** | 5~10분 후 삭제         | 보안과 메모리 절약    |
| **시도 제한** | 5회 초과 시 차단       | 무차별 대입 공격 방지 |
| **일시성**    | 인증 완료 후 즉시 삭제 | 개인정보 최소 보관    |

#### DB vs Redis 비교

| 기준            | MySQL/PostgreSQL                    | Redis                    |
| --------------- | ----------------------------------- | ------------------------ |
| **데이터 접근** | 버퍼 풀·인덱스를 활용한 관계형 조회 | 메모리 기반 키 조회      |
| **TTL 지원**    | ❌                                  | ✅ (자동 만료)           |
| **원자적 갱신** | 트랜잭션·조건부 UPDATE 등 활용      | INCR·HINCRBY·Lua 등 활용 |
| **영속성**      | 장기 보관                           | RDB/AOF로 백업 가능      |

짧은 수명, 자동 만료, 빈번한 읽기·쓰기가 핵심인 인증 코드에는 Redis가 적합합니다. 반대로 감사 이력처럼 장기 보관과 관계형 조회가 필요하다면 별도의 영속 저장소가 필요합니다.

---

## 2. Redis TTL

#### DB로 구현 시

```sql
CREATE TABLE email_codes (
    email VARCHAR(255),
    code VARCHAR(10),
    expired_at TIMESTAMP
);
```

- 조회할 때마다 `expired_at > NOW()` 조건 체크
- 배치 작업으로 수동 삭제 필요 (코드 + 스케줄러 설정)
- 만료된 데이터가 즉시 삭제되지 않음 (디스크 공간 낭비)

#### Redis로 구현할 경우

```java
// 인증 코드 저장 + 5분 TTL 설정
redisTemplate.opsForValue()
    .set("email:code:" + email, code, 5, TimeUnit.MINUTES);
```

#### 선택 기준

- Redis를 선택한 핵심 이유는 단순한 속도 비교가 아니라, 짧은 수명의 데이터를 TTL로 만료시키고 시도 횟수를 원자적으로 갱신하기 쉽다는 점입니다.
- 관계형 DB도 버퍼 풀과 인덱스를 활용하므로 모든 조회가 디스크 I/O나 Row Lock을 거친다고 볼 수는 없습니다.

---

## 3. Redis를 통한 이메일 인증 구현

#### 데이터 구조 설계

```
Key: email:verification:{email}

Fields:
  - code: "A1B2C3"
  - attempts: 3
  - created_at: "2025-01-27T10:30:00"
```

**Hash 구조의 장점**

- **데이터 응집도**: 같은 이메일의 모든 정보를 한 곳에 관리
- **부분 업데이트**: `code`는 그대로 두고 `attempts`만 증가 가능
- **메모리 효율**: 작은 Hash는 Redis 설정에 따라 listpack 형태로 압축 저장 가능

#### Java 코드 구현

```java
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final String KEY_PREFIX = "email:verification:"; // 키 구조
    private static final int MAX_ATTEMPTS = 5; // 최대 횟수
    private static final int CODE_EXPIRY_MINUTES = 5; // 프로젝트 적용 값

    private final RedisTemplate redisTemplate;

    // 1) 인증 코드 생성 및 저장(hash)
    public String generateCode(String email) {
        String code = generateRandomCode();
        String key = KEY_PREFIX + email;

        Map data = new HashMap<>();
        data.put("code", code);
        data.put("attempts", 0);
        data.put("created_at", LocalDateTime.now().toString());

        redisTemplate.opsForHash().putAll(key, data);
        redisTemplate.expire(key, CODE_EXPIRY_MINUTES, TimeUnit.MINUTES);

        return code;
    }

    // 2) 인증 코드 검증(Redis 자체)
    public boolean verify(String email, String inputCode) {
        String key = KEY_PREFIX + email;

        // 1. 키 존재 여부 확인
        if (!Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            throw new CodeExpiredException("인증 코드가 만료되었거나 존재하지 않습니다.");
        }

        // 2. 시도 횟수 증가
        Long attempts = redisTemplate.opsForHash()
            .increment(key, "attempts", 1);

        // 3. 최대 시도 횟수 체크
        if (attempts > MAX_ATTEMPTS) {
            throw new TooManyAttemptsException(
                "인증 시도 횟수가 초과되었습니다."
            );
        }

        // 4. 코드 일치 확인
        String storedCode = (String) redisTemplate.opsForHash()
            .get(key, "code");

        if (storedCode == null) {
            throw new CodeExpiredException("인증 코드가 만료되었습니다.");
        }

        boolean isValid = storedCode.equals(inputCode);

        // 5. 인증 성공 시 즉시 삭제
        if (isValid) {
            redisTemplate.delete(key);
        }

        return isValid;
    }

    // 3) 재발급 시, 이전 코드 무효화
    public String regenerateCode(String email) {
        String key = KEY_PREFIX + email;
        redisTemplate.delete(key);
        return generateCode(email);
    }

    // 4) IP당 1분에 2번 요청 가능
    public void checkRateLimit(String ip) {
        String key = "rate:limit:" + ip;
        Long requests = redisTemplate.opsForValue().increment(key);

        if (requests == 1) { // 첫 요청 시 TTL 설정
        redisTemplate.expire(key, 1, TimeUnit.MINUTES);
        }

        if (requests > 2) {
            throw new RateLimitExceededException("너무 많은 요청입니다. 1분 후 다시 시도하세요.");
         }
    }

    // 5) 인증코드 생성
    private String generateRandomCode() {
        return RandomStringUtils.randomAlphanumeric(6).toUpperCase();
    }
}
```

### 주의점 1) 만료된 키에 대한 `increment`

```java
Long attempts = redisTemplate.opsForHash()
    .increment(key, "attempts", 1);
```

- 인증 코드가 만료되어도 계속 검증 요청이 올 경우,
- 위의 코드에서는 새로 키를 생성

**결과:**

- `code` 필드는 없고 `attempts` 필드만 있는 **키** 생성
- TTL도 없어서 **영원히 메모리에 남음** (메모리 누수 발생)

**해결**

```java
// 키 존재 여부 먼저 체크
if (!Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
    throw new CodeExpiredException("인증 코드가 만료되었습니다.");
}

// 이후 increment 실행
```

**보충**

`hasKey`와 `increment`는 별도 명령이므로 그 사이에 TTL이 만료될 수 있습니다. 실제로는 Lua Script에서 키 존재 확인과 증가를 하나의 원자적 작업으로 묶거나, 데이터 모델에 맞는 단일 명령 구조를 사용해야 합니다.

시도 횟수 증가 자체의 원자성과 Read–Modify–Write 비교는 [레디스는 싱글스레드인데 왜 동시성 제어가 필요할까?](./redis-concurrency)에서 별도로 다룹니다.

### 주의점 2) Hash vs String 구조 비교

- **Hash 구조의 경우**
  - 데이터 응집도 좋음 (한 곳에 모든 정보)
  - 코드와 시도 횟수는 같은 생명 주기
  - 부분 업데이트 효율적
  - **개별 필드에 다른 TTL을 걸 수 없음**

- **String 구조의 경우**
  - 필드마다 **다른 TTL**이 필요할 때만 고려

---

## 4. 정리

이메일 인증처럼 수명이 짧고 만료 정책이 명확한 데이터에는 Redis의 TTL과 원자 연산이 유용합니다.

- **운영 효율성:**
  별도의 배치 작업이나 스케줄러 없이 TTL로 만료 데이터를 자동 정리할 수 있습니다.
- **성능 최적화:**
  인증 과정의 빈번한 읽기·쓰기 작업을 메모리에서 처리해 관계형 DB의 부하를 줄일 수 있습니다.
- **보안:**
  원자 연산을 활용하면 여러 애플리케이션 인스턴스에서도 시도 횟수를 일관되게 집계할 수 있습니다.

다만 만료된 Hash에 `increment`를 실행하면 TTL이 없는 고아 키가 누적될 수 있습니다. 단순한 사전 존재 확인만으로는 명령 사이의 경쟁 조건을 제거할 수 없으므로, 키 확인과 증가를 원자적으로 처리하고 인증 코드와 시도 횟수의 생명 주기를 함께 관리해야 합니다.
