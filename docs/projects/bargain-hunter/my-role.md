---
sidebar_position: 3
title: 담당 역할
description: 프로젝트에서의 기여도와 기술적 문제 해결 경험
---

# 담당 역할

## 🔐 Backend - Auth Service & Gateway

### 인증/인가 시스템 설계 및 구현

#### 1. JWT + Refresh Token 기반 인증 시스템

**구현 내용**

- Access Token과 Refresh Token 이중 토큰 구조
- Refresh Token DB 저장 및 자동 갱신 로직
- 로그아웃 시 Refresh Token 즉시 삭제

**코드 예시**

```java
@Transactional
public TokenPair generateTokens(User user) {
    // 기존 토큰 삭제 (단일 기기 로그인)
    refreshTokenRepository.deleteByUserId(user.getId());

    // 새 토큰 생성
    Token accessToken = jwtTokenProvider.generateAccessToken(...);
    Token refreshToken = jwtTokenProvider.generateRefreshToken(...);

    // Refresh Token DB 저장
    RefreshToken tokenEntity = RefreshToken.create(
        user.getId(),
        refreshToken.getToken(),
        Date.from(refreshToken.getTokenExpiry())
    );
    refreshTokenRepository.save(tokenEntity);

    return new TokenPair(accessToken, refreshToken);
}
```

**주요 기능**

- ✅ Access Token 자동 갱신
- ✅ Refresh Token 탈취 시 즉시 대응 가능
- ✅ 단일 기기 로그인 지원
- ✅ 로그아웃 시 토큰 즉시 무효화

---

#### 2. Google OAuth2 + PKCE 플로우 통합

**PKCE 플로우**

```typescript
// Frontend: code_verifier 생성
const codeVerifier = generateRandomString(43);
const codeChallenge = await sha256(codeVerifier);

// Authorization Code 요청
const authUrl = `${GOOGLE_AUTH_URL}?
  client_id=${CLIENT_ID}&
  redirect_uri=${REDIRECT_URI}&
  response_type=code&
  scope=openid%20email%20profile&
  code_challenge=${codeChallenge}&
  code_challenge_method=S256`;
```

```java
// Backend: Token 교환 및 검증
@Service
public class OAuth2Service {

    @Autowired
    private OAuth2FeignClient oAuth2FeignClient;

    public TokenPair processOAuth2Login(
        String code,
        String codeVerifier
    ) {
        // Google로부터 토큰 교환
        GoogleTokenResponse tokenResponse =
            oAuth2FeignClient.exchangeToken(
                code,
                codeVerifier
            );

        // 사용자 정보 조회
        GoogleUserInfo userInfo =
            oAuth2FeignClient.getUserInfo(
                tokenResponse.getAccessToken()
            );

        // 회원 가입 또는 로그인 처리
        User user = userService.findOrCreateUser(userInfo);

        // JWT 토큰 생성
        return generateTokens(user);
    }
}
```

**Feign Client 활용**

```java
@FeignClient(name = "google-oauth", url = "https://oauth2.googleapis.com")
public interface OAuth2FeignClient {

    @PostMapping("/token")
    GoogleTokenResponse exchangeToken(
        @RequestParam("code") String code,
        @RequestParam("code_verifier") String codeVerifier,
        @RequestParam("client_id") String clientId,
        @RequestParam("redirect_uri") String redirectUri,
        @RequestParam("grant_type") String grantType
    );

    @GetMapping("/oauth2/v1/userinfo")
    GoogleUserInfo getUserInfo(
        @RequestHeader("Authorization") String bearerToken
    );
}
```

**보안 강화**

- ✅ PKCE 적용으로 Authorization Code Interception 방지
- ✅ code_verifier를 통한 추가 검증
- ✅ 탈취된 Authorization Code 재사용 불가

---

#### 3. Redis 기반 이메일 인증 시스템

**문제점**

- 동시 요청 시 Race Condition 발생
- 인증 코드와 시도 횟수 불일치
- GET → 검증 → SET 과정에서 데이터 정합성 문제

**해결: Redis Hash + HINCRBY 원자적 연산**

```java
@Service
public class VerificationService {

    // 인증 코드 저장 (Hash 구조)
    public void saveCode(String email, String code, VerificationType type) {
        String key = buildKey(email, type);

        Map data = new HashMap<>();
        data.put("code", code);
        data.put("attemptCount", "0");

        stringRedisTemplate.opsForHash().putAll(key, data);
        stringRedisTemplate.expire(key, Duration.ofMinutes(5));
    }

    // 인증 코드 검증 (원자적 증가)
    public void verifyCode(String email, String inputCode, VerificationType type) {
        String key = buildKey(email, type);

        // 1. 코드 조회
        String savedCode = (String) stringRedisTemplate
            .opsForHash()
            .get(key, "code");

        if (savedCode.equals(inputCode)) {
            stringRedisTemplate.delete(key);
            return; // 인증 성공
        }

        // 2. 시도 횟수 원자적 증가
        Long newAttemptCount = stringRedisTemplate
            .opsForHash()
            .increment(key, "attemptCount", 1);

        // 3. 시도 횟수 확인
        if (newAttemptCount > 5) {
            stringRedisTemplate.delete(key);
            throw new InvalidCodeException("인증 시도 횟수 초과");
        }

        int remaining = 5 - newAttemptCount.intValue();
        throw new InvalidCodeException(
            "인증코드 불일치 (남은 시도: " + remaining + "회)"
        );
    }
}
```

**성과**

- ✅ Hash 구조로 코드와 시도 횟수 일관성 보장
- ✅ HINCRBY 원자적 연산으로 정확한 카운팅
- ✅ TTL 자동 만료로 메모리 효율 향상

---

#### 4. Spring Event + @Async 비동기 이메일 발송

**문제점**

- JavaMailSender.send()가 동기 블로킹 방식
- SMTP 서버 응답 대기 시간 (평균 2~3초)
- 사용자는 이메일 발송 완료까지 대기

**해결: 이벤트 기반 비동기 처리**

```java
// 1. 이벤트 발행
@Service
public class VerificationService {
    private final ApplicationEventPublisher eventPublisher;

    public void createAndSendCode(String email, VerificationType type) {
        String code = generateRandomCode();
        redisService.saveCode(email, code, type); // Redis 저장 (동기)

        // 이벤트 발행 (비동기)
        eventPublisher.publishEvent(
            new VerificationCodeCreatedEvent(this, email, code, type)
        );

        log.info("인증코드 생성 완료: email={}", email);
    }
}

// 2. 이벤트 리스너
@Component
public class VerificationCodeEventListener {

    @Async("emailTaskExecutor")
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
        }
    }
}

// 3. ThreadPoolTaskExecutor 설정
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "emailTaskExecutor")
    public Executor emailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("email-async-");
        executor.initialize();
        return executor;
    }
}
```

**성과**

- ✅ API 응답 시간 **2.5초 → 0.2초** (약 **92% 개선**)
- ✅ 이메일 발송 실패 시에도 사용자 응답에 영향 없음
- ✅ 스레드풀로 동시 발송 요청 처리 가능

---

#### 5. Gateway 라우팅 및 인증 필터

**Gateway 설정**

```java
@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            // Auth Service
            .route("auth-service", r -> r.path("/api/auth/**")
                .filters(f -> f
                    .stripPrefix(1)
                    .removeRequestHeader("Cookie"))
                .uri("lb://auth-service"))

            // Review Service (인증 필요)
            .route("review-service", r -> r.path("/api/reviews/**")
                .filters(f -> f
                    .stripPrefix(1)
                    .filter(jwtAuthenticationFilter))
                .uri("lb://review-service"))

            // Tour Service
            .route("tour-service", r -> r.path("/api/tours/**")
                .filters(f -> f.stripPrefix(1))
                .uri("lb://tour-service"))

            .build();
    }
}
```

**JWT 인증 필터**

```java
@Component
public class JwtAuthenticationFilter implements GatewayFilter {

    @Override
    public Mono filter(
        ServerWebExchange exchange,
        GatewayFilterChain chain
    ) {
        String token = extractToken(exchange.getRequest());

        if (token == null) {
            return onError(exchange, "No token provided");
        }

        try {
            // JWT 검증
            Claims claims = jwtTokenProvider.validateToken(token);

            // 사용자 정보를 헤더에 추가
            ServerHttpRequest modifiedRequest = exchange.getRequest()
                .mutate()
                .header("X-User-Id", claims.getSubject())
                .header("X-User-Email", claims.get("email", String.class))
                .build();

            return chain.filter(
                exchange.mutate()
                    .request(modifiedRequest)
                    .build()
            );

        } catch (JwtException e) {
            return onError(exchange, "Invalid token");
        }
    }
}
```

**주요 역할**

- ✅ 모든 요청의 단일 진입점
- ✅ JWT 검증을 Gateway에서 일괄 처리
- ✅ 인증된 사용자 정보를 헤더로 전달
- ✅ 서비스별 라우팅 및 로드밸런싱

---

#### 6. 회원 관리 API 구현

**주요 API**

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    // 프로필 조회
    @GetMapping("/profile")
    public ResponseEntity getProfile(
        @AuthenticationPrincipal UserPrincipal user
    ) {
        return ResponseEntity.ok(
            userService.getProfile(user.getId())
        );
    }

    // 프로필 수정
    @PutMapping("/profile")
    public ResponseEntity updateProfile(
        @AuthenticationPrincipal UserPrincipal user,
        @RequestBody @Valid UpdateProfileRequest request
    ) {
        userService.updateProfile(user.getId(), request);
        return ResponseEntity.ok().build();
    }

    // 비밀번호 재설정
    @PatchMapping("/password")
    public ResponseEntity resetPassword(
        @RequestBody @Valid ResetPasswordRequest request
    ) {
        userService.resetPassword(request);
        return ResponseEntity.ok().build();
    }

    // 닉네임 중복 검증
    @GetMapping("/check-nickname")
    public ResponseEntity checkNickname(
        @RequestParam String nickname
    ) {
        boolean available = userService.isNicknameAvailable(nickname);
        return ResponseEntity.ok(available);
    }

    // 회원 탈퇴
    @DeleteMapping("/withdraw")
    public ResponseEntity withdraw(
        @AuthenticationPrincipal UserPrincipal user
    ) {
        userService.withdraw(user.getId());
        return ResponseEntity.ok().build();
    }
}
```

---

## 🎨 Frontend - Auth 관련 UI/UX

### 1. PKCE + OAuth2 로그인 플로우 구현

```typescript
// OAuth2 로그인 훅
export const useOAuth2Login = () => {
  const navigate = useNavigate();

  const initiateLogin = async () => {
    // code_verifier 생성 및 저장
    const codeVerifier = generateRandomString(43);
    sessionStorage.setItem("code_verifier", codeVerifier);

    // code_challenge 계산
    const codeChallenge = await sha256(codeVerifier);

    // Google 로그인 페이지로 리다이렉트
    const authUrl = buildAuthUrl(codeChallenge);
    window.location.href = authUrl;
  };

  const handleCallback = async (code: string) => {
    const codeVerifier = sessionStorage.getItem("code_verifier");

    try {
      // 백엔드로 code와 code_verifier 전송
      const response = await api.post("/auth/oauth2/google", {
        code,
        codeVerifier,
      });

      // 토큰 저장
      setAccessToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);

      navigate("/");
    } catch (error) {
      console.error("OAuth2 login failed:", error);
    }
  };

  return { initiateLogin, handleCallback };
};
```

---

### 2. Axios 인터셉터로 Access Token 자동 재발급

```typescript
// Axios 인터셉터 설정
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Access Token 만료
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token으로 Access Token 재발급
        const refreshToken = getRefreshToken();
        const response = await api.post("/auth/refresh", {
          refreshToken,
        });

        // 새 Access Token 저장
        setAccessToken(response.data.accessToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료된 경우 로그아웃
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

### 3. 유저 프로필/설정 UI 개발

- 프로필 정보 조회 및 수정
- 비밀번호 변경
- 회원 탈퇴
- 닉네임 중복 검증 (실시간 확인)

---

## 📊 성과 요약

| 항목            | 성과                                                |
| --------------- | --------------------------------------------------- |
| **성능 개선**   | 이메일 발송 API 응답 시간 92% 개선 (2.5초 → 0.2초)  |
| **보안 강화**   | PKCE 적용, Refresh Token DB 관리, Gateway 중앙 인증 |
| **동시성 제어** | Redis HINCRBY를 활용한 정확한 카운팅                |
| **아키텍처**    | MSA 기반 독립적인 서비스 구조 설계                  |
| **협업**        | API 명세서 작성 및 팀 간 통합 규약 문서화           |
