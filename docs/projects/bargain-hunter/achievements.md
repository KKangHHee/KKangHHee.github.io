---
sidebar_position: 4
title: 주요 성과 및 배운 점
description: 수치 기반 성과, 성능 개선 사례, 프로젝트를 통해 배운 점 정리
---

# 주요 성과 및 배운 점

## 🎯 주요 성과

### 1️⃣ 이벤트 기반 아키텍처 적용

**성과**: API 응답 속도 92% 개선 (2.5초 → 0.2초)

#### AS-IS: 동기 블로킹 방식

```java
public void createAndSendCode(String email, VerificationType type) {
    String code = generateRandomCode();
    redisService.saveCode(email, code, type);  // 0.1초

    // 동기 블로킹 - SMTP 서버 응답 대기
    emailService.sendVerificationCode(email, code, type);  // 2.4초

    // 총 응답 시간: 2.5초
}
```

#### TO-BE: 이벤트 기반 비동기 처리

```java
public void createAndSendCode(String email, VerificationType type) {
    String code = generateRandomCode();
    redisService.saveCode(email, code, type);  // 0.1초

    // 이벤트 발행 (비동기)
    eventPublisher.publishEvent(
        new VerificationCodeCreatedEvent(this, email, code, type)
    );  // 0.1초

    // 총 응답 시간: 0.2초 (이메일 발송은 별도 스레드에서 처리)
}
```

**측정 결과**
| 시나리오 | Before | After | 개선율 |
|----------|--------|-------|--------|
| API 응답 시간 | 2.5초 | 0.2초 | 92% ↓ |
| 사용자 대기 시간 | 2.5초 | 0.2초 | 92% ↓ |
| 동시 처리 가능 수 | 10 req/s | 100+ req/s | 10배 ↑ |

---

### 2️⃣ PKCE 적용으로 OAuth2 보안 강화

**위협**: Authorization Code Interception Attack

#### 공격 시나리오 (PKCE 미적용 시)

```
1. 공격자가 사용자의 Authorization Code를 탈취
2. 공격자가 탈취한 코드로 Token 교환 요청
3. 공격자가 사용자 계정에 접근
```

#### PKCE 플로우 (보안 강화)

```typescript
// 1. code_verifier 생성 (43자 랜덤 문자열)
const codeVerifier = generateRandomString(43);

// 2. code_challenge 계산 (SHA256)
const codeChallenge = await sha256(codeVerifier);

// 3. Authorization Code 요청 시 code_challenge 전송
const authUrl = `${GOOGLE_AUTH_URL}?
  code_challenge=${codeChallenge}&
  code_challenge_method=S256&
  ...`;

// 4. Token 교환 시 code_verifier 검증
// code_verifier를 알지 못하는 공격자는 토큰 교환 불가
```

**보안 효과**

- ✅ Authorization Code 탈취 시에도 토큰 교환 불가
- ✅ code_verifier가 없으면 토큰 교환 실패
- ✅ 모바일 앱, SPA에서도 안전한 OAuth2 구현

---

### 3️⃣ Redis Hash + HINCRBY로 동시성 문제 해결

**문제 상황**: Race Condition

```java
// AS-IS: Race Condition 발생
public void verifyCode(String email, String inputCode) {
    // 1. 시도 횟수 조회 (GET)
    int attemptCount = getAttemptCount(email);  // Thread A: 4
                                                 // Thread B: 4

    // 2. 검증 실패 시 증가 (SET)
    if (!isValid(inputCode)) {
        attemptCount++;  // Thread A: 5
                        // Thread B: 5 (잘못된 값!)
        setAttemptCount(email, attemptCount);
    }
}
```

```java
// TO-BE: HINCRBY 원자적 연산
public void verifyCode(String email, String inputCode) {
    String key = buildKey(email);
    String savedCode = (String) redisTemplate
        .opsForHash()
        .get(key, "code");

    if (!savedCode.equals(inputCode)) {
        // 원자적 증가 - Race Condition 방지
        Long newAttemptCount = redisTemplate
            .opsForHash()
            .increment(key, "attemptCount", 1);  // Thread A: 5
                                                  // Thread B: 6 (정확!)

        if (newAttemptCount > 5) {
            throw new InvalidCodeException("인증 시도 횟수 초과");
        }
    }
}
```

**개선 효과**

- ✅ 동시 요청 시에도 정확한 카운팅
- ✅ Hash 구조로 데이터 일관성 보장
- ✅ TTL 자동 만료로 메모리 효율 향상

---

### 4️⃣ Refresh Token DB 저장으로 보안 강화

**문제**: JWT의 Stateless 특성상 토큰 탈취 시 대응 어려움

#### 해결: Refresh Token DB 저장

```java
@Transactional
public TokenPair generateTokens(User user) {
    // 1. 기존 토큰 삭제 (단일 기기 로그인)
    refreshTokenRepository.deleteByUserId(user.getId());

    // 2. 새 토큰 생성
    Token accessToken = jwtTokenProvider.generateAccessToken(...);
    Token refreshToken = jwtTokenProvider.generateRefreshToken(...);

    // 3. Refresh Token DB 저장
    RefreshToken tokenEntity = RefreshToken.create(
        user.getId(),
        refreshToken.getToken(),
        Date.from(refreshToken.getTokenExpiry())
    );
    refreshTokenRepository.save(tokenEntity);

    return new TokenPair(accessToken, refreshToken);
}

@Transactional
public void logout(String refreshToken) {
    // DB에서 즉시 삭제 → 재사용 불가
    refreshTokenRepository.deleteByToken(refreshToken);
}
```

**보안 효과**

- ✅ 로그아웃 시 DB에서 즉시 삭제 → 재사용 불가
- ✅ 토큰 탈취 감지 시 해당 사용자의 모든 토큰 무효화 가능
- ✅ 영구 저장으로 로그 추적 가능
- ✅ 단일 기기 로그인 지원

---

### 5️⃣ Gateway 단일 JWT 검증으로 인증 오버헤드 제거

#### AS-IS: 각 서비스마다 JWT 검증

```
Client → Auth Service (JWT 검증)
      → Review Service (JWT 검증)
      → Tour Service (JWT 검증)

각 서비스마다 JWT 파싱 및 검증 → 오버헤드 발생
```

#### TO-BE: Gateway에서 단일 검증

```
Client → Gateway (JWT 검증 1회)
      → Auth Service (헤더에서 사용자 정보 추출)
      → Review Service (헤더에서 사용자 정보 추출)
      → Tour Service (헤더에서 사용자 정보 추출)
```

```java
// Gateway Filter
@Override
public Mono filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String token = extractToken(exchange.getRequest());

    // JWT 검증 (1회)
    Claims claims = jwtTokenProvider.validateToken(token);

    // 사용자 정보를 헤더에 추가
    ServerHttpRequest modifiedRequest = exchange.getRequest()
        .mutate()
        .header("X-User-Id", claims.getSubject())
        .header("X-User-Email", claims.get("email", String.class))
        .header("X-User-Role", claims.get("role", String.class))
        .build();

    return chain.filter(exchange.mutate().request(modifiedRequest).build());
}

// 각 서비스에서는 헤더에서 추출만
@RestController
public class ReviewController {

    @PostMapping("/reviews")
    public ResponseEntity createReview(
        @RequestHeader("X-User-Id") Long userId,
        @RequestBody CreateReviewRequest request
    ) {
        reviewService.createReview(userId, request);
        return ResponseEntity.ok().build();
    }
}
```

**성능 효과**

- ✅ JWT 파싱/검증 횟수 감소
- ✅ 각 서비스의 응답 시간 단축
- ✅ 인증 로직 중앙 집중화로 유지보수 용이

---

## 📚 배운 점

### 1️⃣ MSA 아키텍처 설계 경험

**서비스 간 통신 방법**

- REST API: 동기 통신
- Kafka: 비동기 메시징
- Feign Client: 선언적 HTTP 클라이언트

**서비스 분리 전략**

- 도메인별 독립적인 서비스
- 데이터베이스도 서비스별로 분리
- 각 서비스는 독립적으로 배포 및 확장 가능

**Gateway를 통한 인증 정보 전달**

- Gateway에서 JWT 검증 후 헤더로 전달
- 각 서비스는 헤더에서 사용자 정보 추출
- 서비스 간 인증 로직 중복 제거

---

### 2️⃣ 보안 중심 설계

**OAuth2 + PKCE 플로우 이해**

- Authorization Code Interception 공격 이해
- PKCE를 통한 추가 보안 계층
- code_verifier와 code_challenge의 역할

**JWT + Refresh Token 관리 전략**

- Access Token: 짧은 만료 시간 (1시간)
- Refresh Token: 긴 만료 시간 (2주), DB 저장
- 토큰 갱신 플로우 구현

**CSRF/XSS 대응**

- SameSite 쿠키 속성 설정
- XSS 방지를 위한 입력 검증 및 출력 이스케이핑
- Content Security Policy (CSP) 설정

---

### 3️⃣ 성능 최적화 전략

**이벤트 기반 비동기 처리의 효과**

- 블로킹 작업을 비동기로 처리하여 응답 시간 단축
- ThreadPoolTaskExecutor 설정 및 튜닝
- 이벤트 발행/구독 패턴 이해

**Redis를 활용한 동시성 제어**

- Redis의 원자적 연산 활용 (HINCRBY, INCR)
- Race Condition 이해 및 해결 방법
- 분산 환경에서의 동시성 제어

**ThreadPoolTaskExecutor 설정**

```java
executor.setCorePoolSize(2);      // 기본 스레드 수
executor.setMaxPoolSize(5);       // 최대 스레드 수
executor.setQueueCapacity(100);   // 큐 크기
```

- CorePoolSize: 항상 살아있는 스레드
- MaxPoolSize: 부하 시 증가 가능한 최대 스레드
- QueueCapacity: 대기 작업 큐 크기

---

### 4️⃣ 협업 및 문서화

**API 명세서 작성 (Swagger)**

- OpenAPI 3.0 기반 문서화
- 요청/응답 예시 제공
- 프론트엔드 개발자와의 협업 효율 향상

**팀 간 기술 스택 통일**

- 코드 컨벤션 정립 (Google Java Style Guide)
- Git Flow 전략 수립
- PR 리뷰 문화 구축

**애자일 스프린트 기반 개발**

- 2주 단위 스프린트
- 매주 회고 및 계획 회의
- Notion을 통한 작업 관리

---

## 🚀 향후 개선 방향

### 기술적 개선

- [ ] Elasticsearch를 활용한 검색 기능 고도화
- [ ] Redis Cluster를 통한 캐시 고가용성 확보
- [ ] Kafka를 활용한 이벤트 소싱 패턴 도입
- [ ] Spring Cloud Sleuth를 통한 분산 추적

### 성능 개선

- [ ] DB 쿼리 최적화 (N+1 문제 해결)
- [ ] CDN을 활용한 정적 리소스 배포
- [ ] Redis Pub/Sub를 활용한 실시간 알림

### 모니터링

- [ ] Prometheus + Grafana 모니터링 구축
- [ ] ELK Stack를 통한 로그 수집 및 분석
- [ ] Sentry를 통한 에러 트래킹

---

## 📊 트러블슈팅 상세

프로젝트 개발 중 발생한 기술적 이슈들과 해결 과정은 블로그에서 확인하실 수 있습니다.

- [Refresh Token 관리 전략](/blog/troubleshooting/bargain-hunter/refresh-token)
- [이메일 인증 동시성 문제 해결](/blog/troubleshooting/bargain-hunter/email-concurrency)
- [이메일 발송 지연 개선](/blog/troubleshooting/bargain-hunter/email-async)
