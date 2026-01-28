---
slug: redis-email-verification
title: "이메일 인증에서 Redis가 강점을 갖는 이유: TTL과 원자 연산"
date: 2025-10-10
categories: [Redis, Backend, Security]
tags: []
---

# 이메일 인증에서 Redis가 강점을 갖는 이유

> "이메일 인증 코드는 왜 DB가 아닌 Redis에 저장할까?"

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

| 기준          | MySQL/PostgreSQL            | Redis                   |
| ------------- | --------------------------- | ----------------------- |
| **읽기 속도** | 상대적으로 느림(디스크 I/O) | 상대적으로 빠름(메모리) |
| **TTL 지원**  | ❌                          | ✅ (자동 만료)          |
| **동시성**    | Row Lock 필요               | 원자 연산 기본 지원     |
| **영속성**    | 장기 보관                   | RDB/AOF로 백업 가능     |

- **일시적 데이터 + 빠른 속도 + 자동 만료**에서는 **Redis가 압도적 우위**

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

#### redis의 경우

```java
// 인증 코드 저장 + 10분 TTL 설정
redisTemplate.opsForValue()
    .set("email:code:" + email, code, 10, TimeUnit.MINUTES);
```

#### Redis가 빠른 이유

- MySQL:
  요청 → 디스크 I/O → 인덱스 검색 → Row Lock → 결과 반환

- Redis:
  요청 → 메모리 해시 조회 → 결과 반환

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
- **메모리 효율**: 작은 Hash는 Ziplist로 압축되어 메모리 절약

#### 코드 구현(java)

```java
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final String KEY_PREFIX = "email:verification:"; // 키 구조
    private static final int MAX_ATTEMPTS = 5; // 최대 횟수
    private static final int CODE_EXPIRY_MINUTES = 10; // 만료 시간

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

> 데이터의 생명 주기가 짧은 데이터(인증 코드)의 경우 redis가 최적임

- **운영 효율성:**
  별도의 Batch 작업이나 스케줄러 없이도 TTL을 통해 만료 데이터를 자동 정리함
- **성능 최적화:**
  인증 과정에서 발생하는 빈번한 쓰기/읽기 작업이 메모리 내에서 처리되어 DB 부하가 없음
- **보안:**
  원자적 연산을 활용해 분산 환경에서도 정확한 카운팅 가능
- **비용 절감:**
  일시적인 데이터를 위해 RDB의 커넥션과 저장 공간을 낭비하지 않음
