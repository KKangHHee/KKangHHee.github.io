---
sidebar_position: 3
title: Refresh Token 관리 전략
---

# Refresh Token DB 저장 전략

> Redis vs PostgreSQL 비교 및 보안 강화

---

## 0. 개요

:::danger 문제 상황

- **로그아웃 시 Refresh Token 즉시 무효화** 필요
- **단일 기기 로그인** 지원 필요
- **탈취된 토큰 감지 및 폐기** 필요
  :::

:::tip 해결 방향

- Refresh Token을 **PostgreSQL에 저장**
- 로그아웃 시 DB에서 즉시 삭제
- 토큰 탈취 감지 시 해당 사용자의 모든 토큰 무효화 가능
  :::

---

## 1. Redis vs DB 비교

| 항목                     | Redis 저장       | **PostgreSQL (채택)**         |
| ------------------------ | ---------------- | ----------------------------- |
| **로그아웃 즉시 무효화** | ❌ TTL 만료 대기 | ✅ 즉시 DELETE                |
| **로그 추적**            | ❌ 휘발성 데이터 | ✅ 영구 저장                  |
| **단일 기기 로그인**     | △ (Key 덮어쓰기) | ✅ (userId 기준 삭제 후 저장) |
| **토큰 탈취 대응**       | △ (개별 삭제)    | ✅ (userId 기준 전체 삭제)    |
| **만료 처리**            | ✅ TTL 자동      | △ (스케줄러 필요)             |
| **성능**                 | ✅ 빠름          | △ (DB I/O 발생)               |

**선택 이유**

- 보안이 중요한 인증 서비스 특성상 **로그 추적 및 즉시 무효화**가 우선
- Refresh Token 조회 빈도가 낮아 **DB I/O 부담 적음**
- 스케줄러로 만료 토큰 정리 가능

---

## 2. DB 스키마 설계

### RefreshToken 엔티티

```java
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, unique = true, length = 500)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // 토큰 생성 메서드
    public static RefreshToken create(Long userId, String token, Date expiryDate) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.userId = userId;
        refreshToken.token = token;
        refreshToken.expiryDate = LocalDateTime.ofInstant(
            expiryDate.toInstant(),
            ZoneId.systemDefault()
        );
        refreshToken.createdAt = LocalDateTime.now();
        return refreshToken;
    }

    // 만료 확인 메서드
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
}
```

---

## 3. 토큰 생성 로직

```java
@Service
@Transactional
public class TokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public TokenPair generateTokens(User user) {
        // 1. 기존 토큰 삭제 (단일 기기 로그인)
        refreshTokenRepository.deleteByUserId(user.getId());

        // 2. 새 토큰 생성
        Token accessToken = jwtTokenProvider.generateAccessToken(
            user.getId(),
            user.getEmail(),
            user.getRole()
        );

        Token refreshToken = jwtTokenProvider.generateRefreshToken(
            user.getId()
        );

        // 3. Refresh Token DB 저장
        RefreshToken tokenEntity = RefreshToken.create(
            user.getId(),
            refreshToken.getToken(),
            Date.from(refreshToken.getTokenExpiry())
        );
        refreshTokenRepository.save(tokenEntity);

        log.info("토큰 생성 완료: userId={}", user.getId());

        return new TokenPair(accessToken, refreshToken);
    }
}
```

**핵심 포인트**

- ✅ `deleteByUserId()`로 기존 토큰 삭제 → **단일 기기 로그인** 보장
- ✅ Refresh Token을 DB에 저장 → **로그 추적** 가능
- ✅ 트랜잭션으로 삭제 → 저장 원자성 보장

---

## 4. 토큰 갱신 로직

```java
@Service
@Transactional
public class TokenService {

    public TokenPair refreshAccessToken(String refreshTokenStr) {
        // 1. Refresh Token 검증
        Claims claims = jwtTokenProvider.validateToken(refreshTokenStr);
        Long userId = Long.parseLong(claims.getSubject());

        // 2. DB에서 Refresh Token 조회
        RefreshToken refreshToken = refreshTokenRepository
            .findByToken(refreshTokenStr)
            .orElseThrow(() -> new InvalidTokenException("Refresh Token이 존재하지 않습니다."));

        // 3. 만료 확인
        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new InvalidTokenException("Refresh Token이 만료되었습니다.");
        }

        // 4. 사용자 조회
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다."));

        // 5. 새 Access Token 생성
        Token newAccessToken = jwtTokenProvider.generateAccessToken(
            user.getId(),
            user.getEmail(),
            user.getRole()
        );

        log.info("Access Token 갱신 완료: userId={}", userId);

        return new TokenPair(newAccessToken, new Token(refreshTokenStr, refreshToken.getExpiryDate()));
    }
}
```

**핵심 포인트**

- ✅ DB에서 Refresh Token 조회 → **탈취된 토큰 감지 가능**
- ✅ 만료된 토큰은 즉시 삭제 → **DB 용량 관리**
- ✅ Refresh Token은 재사용 → **불필요한 업데이트 방지**

---

## 5. 로그아웃 로직

```java
@Service
@Transactional
public class AuthService {

    public void logout(String refreshTokenStr) {
        // Refresh Token DB에서 즉시 삭제
        RefreshToken refreshToken = refreshTokenRepository
            .findByToken(refreshTokenStr)
            .orElseThrow(() -> new InvalidTokenException("Refresh Token이 존재하지 않습니다."));

        refreshTokenRepository.delete(refreshToken);

        log.info("로그아웃 완료: userId={}", refreshToken.getUserId());
    }
}
```

**핵심 포인트**

- ✅ DB에서 즉시 삭제 → **재사용 불가**
- ✅ Access Token은 만료까지 유효 (짧은 만료 시간 권장: 1시간)

---

## 6. 토큰 탈취 대응

### 시나리오: Refresh Token 탈취 감지

```java
@Service
@Transactional
public class SecurityService {

    public void invalidateAllTokens(Long userId) {
        // 해당 사용자의 모든 Refresh Token 삭제
        int deletedCount = refreshTokenRepository.deleteByUserId(userId);

        log.warn("보안 위협 감지 - 모든 토큰 무효화: userId={}, deletedCount={}",
                 userId, deletedCount);

        // 사용자에게 알림 발송
        notificationService.sendSecurityAlert(userId, "비정상적인 로그인이 감지되었습니다.");
    }
}
```

**활용 예시**

- 비정상적인 위치에서 로그인 시도
- 짧은 시간에 여러 기기에서 로그인 시도
- 관리자가 수동으로 계정 보안 강화 필요 시

---

## 7. 만료 토큰 정리 (스케줄러)

```java
@Component
public class TokenCleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;

    // 매일 새벽 3시 실행
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void deleteExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        int deletedCount = refreshTokenRepository.deleteByExpiryDateBefore(now);

        log.info("만료 토큰 정리 완료: deletedCount={}", deletedCount);
    }
}
```

```java
// Repository
public interface RefreshTokenRepository extends JpaRepository {

    Optional findByToken(String token);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.userId = :userId")
    int deleteByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :now")
    int deleteByExpiryDateBefore(@Param("now") LocalDateTime now);
}
```

---

## 8. 보안 강화 포인트

### 1️⃣ 단일 기기 로그인

```java
// 새 로그인 시 기존 토큰 삭제
refreshTokenRepository.deleteByUserId(user.getId());
```

**효과**

- ✅ 한 계정당 하나의 Refresh Token만 유지
- ✅ 다른 기기에서 로그인 시 기존 세션 자동 로그아웃

---

### 2️⃣ 토큰 재사용 감지

```java
public TokenPair refreshAccessToken(String refreshTokenStr) {
    RefreshToken refreshToken = refreshTokenRepository
        .findByToken(refreshTokenStr)
        .orElseThrow(() -> {
            // 토큰이 DB에 없음 → 이미 사용됨 또는 탈취 의심
            log.warn("Refresh Token 재사용 감지: token={}", refreshTokenStr);
            throw new InvalidTokenException("Refresh Token이 유효하지 않습니다.");
        });

    // ...
}
```

---

### 3️⃣ Access Token 짧은 만료 시간

```java
Token accessToken = jwtTokenProvider.generateAccessToken(
    user.getId(),
    user.getEmail(),
    user.getRole(),
    Duration.ofHours(1)  // 1시간
);

Token refreshToken = jwtTokenProvider.generateRefreshToken(
    user.getId(),
    Duration.ofDays(14)  // 2주
);
```

**전략**

- Access Token: 1시간 (탈취 시 피해 최소화)
- Refresh Token: 2주 (사용자 편의성 확보)

---

## 9. 결론

:::success 성과

- Refresh Token을 **PostgreSQL에 저장**하여 보안 강화
- 로그아웃 시 DB에서 **즉시 삭제** → 재사용 불가
- 토큰 탈취 감지 시 해당 사용자의 **모든 토큰 무효화** 가능
- 단일 기기 로그인 지원
  :::

:::tip 배운 점

- **JWT의 Stateless 특성**과 **보안 요구사항**의 트레이드오프
- **Refresh Token 관리 전략**의 중요성
- **Redis vs DB 선택 기준** (성능 vs 보안/추적)
  :::

---

## 10. 추가 고려사항

### 로그 분석

```sql
-- 최근 로그인 이력 조회
SELECT user_id, COUNT(*) as login_count, MAX(created_at) as last_login
FROM refresh_tokens
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY login_count DESC;
```

---

## 11. 참고 자료

- [OWASP - JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [RFC 6749 - OAuth 2.0 Framework](https://datatracker.ietf.org/doc/html/rfc6749)
