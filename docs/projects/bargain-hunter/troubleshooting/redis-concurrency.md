---
sidebar_position: 2
title: 이메일 인증 동시성 문제 해결
---

# 이메일 인증 동시성 문제 해결

> 시도 횟수 증가를 Read–Modify–Write에서 Redis 단일 원자 명령으로 변경

---

## 0. 개요

:::danger 문제 상황

- 이메일 인증 코드 **최대 5회 시도 제한** 요구사항
- 동시에 여러 인증 요청이 들어올 수 있는 환경
- 기존 구조에서 **Race Condition 발생**
- 시도 횟수가 정확히 카운팅되지 않는 문제 발생

:::

:::tip 해결 방향

- Redis **Hash 구조**로 인증 정보 통합 관리
- `HINCRBY`를 활용한 **원자적 시도 횟수 증가**
- TTL 적용으로 자동 만료 및 메모리 관리

:::

---

## 1. 문제 분석

### AS-IS: 분리된 Key 구조

```text
code:{email}     → 인증 코드
attempt:{email}  → 시도 횟수
```

### 인증 로직 흐름 (문제 발생)

1. GET code
2. 코드 비교
3. GET attemptCount
4. SET attemptCount + 1

### ❌ 문제점

1. 두 Key 간 데이터 일관성 깨짐
   - code는 존재하지만 attemptCount가 없는 경우 발생
2. GET → SET 사이 Race Condition
   - 동시에 요청 시 시도 횟수 누락
3. 동시 요청이 많을수록 제한 횟수 초과 허용 가능성 증가

---

## 2. 해결 과정

### Step 1: Redis Hash 구조 설계

```text
verification:{type}:{email}
 ├─ code: 인증 코드
 └─ attemptCount: 시도 횟수
 (TTL: 5분)
```

- 인증 코드와 시도 횟수를 하나의 Key로 묶어 관리
- 코드와 시도 횟수의 생명 주기를 하나의 Key로 관리

### Step 2: 인증 코드 저장

```java
public void saveCode(String email, String code, VerificationType type) {
    String key = buildKey(email, type);

    Map<String, String> data = new HashMap<>();
    data.put("code", code);
    data.put("attemptCount", "0");

    stringRedisTemplate.opsForHash().putAll(key, data);
    stringRedisTemplate.expire(key, Duration.ofMinutes(5)); // TTL 5분
}
```

**포인트**

- Hash 구조로 인증 정보 통합
- TTL 적용으로 만료 자동 처리

### Step 3: 인증 검증 + 시도 횟수 원자적 증가

```java
public void verifyCode(String email, String inputCode, VerificationType type) {
    String key = buildKey(email, type);

    // 1. 코드 조회
    String savedCode = (String) stringRedisTemplate.opsForHash().get(key, "code");

    if (savedCode == null) {
        throw new CodeExpiredException("인증 코드가 만료되었거나 존재하지 않습니다.");
    }

    if (savedCode.equals(inputCode)) {
        stringRedisTemplate.delete(key);
        return; // 인증 성공
    }

    // 2. 시도 횟수 원자적 증가
    Long newAttemptCount = stringRedisTemplate.opsForHash()
        .increment(key, "attemptCount", 1);

    if (newAttemptCount > 5) {
        stringRedisTemplate.delete(key);
        throw new InvalidCodeException("인증 시도 횟수 초과");
    }

    int remaining = 5 - newAttemptCount.intValue();
    throw new InvalidCodeException(
        "인증코드 불일치 (남은 시도: " + remaining + "회)"
    );
}
```

**핵심 포인트**

- HINCRBY → 원자적 연산
- 시도 횟수 증가 명령 사이의 lost update 방지
- 증가 연산 자체에는 별도의 애플리케이션 Lock이 필요하지 않음

---

## 3. TO-BE 아키텍처

```text
[Client 요청]
     ↓
[VerificationService]
     ↓
[Redis Hash 조회]
 ├─ code 비교
 └─ HINCRBY(attemptCount) ← 원자적 처리
     ↓
[성공 → Key 삭제]
[실패 → 남은 횟수 반환]
```

---

## 4. 핵심 개선 포인트

**1️⃣ 데이터 생명 주기 통합**

- 코드 / 시도 횟수를 하나의 Hash Key로 관리
- 코드와 시도 횟수에 동일한 TTL 적용

**2️⃣ 동시성 안전성 확보**

- HINCRBY를 사용해 시도 횟수 증가 과정의 lost update 방지
- 병렬 요청에서 시도 횟수 증가의 lost update 방지

**3️⃣ Redis 메모리 효율 개선**

- TTL 자동 만료 적용
- 불필요한 인증 데이터 잔존 방지

---

## 5. 성과

:::success 성과

- 병렬 요청 테스트에서 lost update 없이 시도 횟수가 집계됨
- 시도 횟수 증가를 여러 단계의 Read–Modify–Write에서 단일 원자 명령으로 변경
- 인증 실패/성공 흐름 단순화
- Redis Key 구조 간결화 및 유지보수성 향상
  :::

:::tip 배운 점

- 동시성 문제의 범위에 따라 자료구조와 원자 명령을 함께 선택해야 함
- Redis 원자적 연산의 중요성 체감
- 분산 환경에서는 “읽고-수정”보다 “한 번에 처리”가 핵심
  :::
