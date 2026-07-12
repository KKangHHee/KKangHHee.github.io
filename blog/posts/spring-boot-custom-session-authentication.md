---
slug: spring-boot-custom-session-authentication
title: "Spring Boot에서 Session 인증을 커스텀하는 이유와 실전 구현"
date: 2025-04-15
categories: [Spring Boot, Security, Backend]
tags: []
---

# Spring Boot에서 Session 인증을 커스텀하는 이유와 실전 구현

> "왜 Spring Security의 기본 Form Login을 쓰지 않고 직접 구현할까?"

이 글에서는 **Admin/Customer 통합 환경**에서 **JSON 기반 로그인 + 중복 로그인 제어**를 구현하며 겪었던 **표준 방식으로는 안 되는 이유**와 **어떻게 우회했는지**를 기록합니다.

<!-- truncate -->

---

## 1. 왜 커스텀 세션 인증?

### 프로젝트 요구사항

| 항목                 | 요구사항                              | 표준 FormLogin 가능 여부 |
| -------------------- | ------------------------------------- | ------------------------ |
| **JSON 기반 로그인** | `{"email": "...", "password": "..."}` | 복잡                     |
| **중복 로그인 제어** | 동일 계정 1명만 로그인 허용           | 가능                     |
| **계정 잠금 처리**   | 5회 실패 시 계정 잠김                 | 커스텀 필요              |
| **첫 로그인 체크**   | 첫 로그인 시 비밀번호 변경 강제       | 커스텀 필요              |
| **타입별 응답**      | Admin/Customer별 다른 응답            | 커스텀 필요              |

### 표준 FormLogin의 한계

**Spring Security의 기본 FormLogin 필터 체인:**

```text
UsernamePasswordAuthenticationFilter
    → AuthenticationManager
    → UserDetailsService (사용자 조회)
    → SuccessHandler / FailureHandler
```

**문제점:**

1. **필터 단계에서는 비즈니스 로직 주입이 복잡**
   - 필터 기반 인증은 커스터마이징이 어렵고, 특히 AuthenticationFailureHandler만으로는 DB 상태 변경(잠금 등)을 처리하기 직관적이지 않음.
2. **실패 카운트를 어디서 관리할까?**
   - 필터는 Stateless하므로 DB 업데이트 로직을 끼워넣기 애매함
3. **첫 로그인 체크는 인증 성공 이후에 판단해야 함**
   - 필터 체인에서는 순서상 어색함

### 해결 방안: Controller + SessionAuthenticationStrategy 조합

> 필터를 우회하여 Controller에서 비즈니스 로직을 선행 처리하되,
> 인증 결과는 Security의 표준 컴포넌트를 이용해 세션 시스템에 등록
> 수동으로 Authentication 객체를 생성하고,
> SecurityContextRepository를 통해 세션에 영속화하는 일련의 과정을 코드로 구현

**[기존] Filter Chain 방식**

```
Request → Filter → AuthenticationManager → Response
```

**[개선] Controller 방식**

```text
Request → Controller → Service (비즈니스 로직)

    → 수동으로 AuthenticationManager 호출
    → SessionAuthenticationStrategy 호출
    → SecurityContext 저장 → Response
```

> **Spring Security의 세션 정책을 그대로 활용하는 방안**

---

## 2. 인증 구현

### 전체 인증 플로우

```
1. [Client] Request
    ↓
2. [Controller] 요청 수신
    ↓
3. [LoginService] 검증
		3.1 사용자 확인
		3.2 계정 활성 여부
		3.3 비밀번호 검증
		3.4 첫 로그인 검증
    ↓
4. [performSecurityAuthentication]
		4.1 AuthenticationManager.authenticate() 호출
		4.2 SessionAuthenticationStrategy.onAuthentication() 호출
				4.2.1) 중복 세션 제어 | 세션 고정 공격 방지 |
				4.2.2) SessionRegistry 등록
		4.3 SecurityContext 생성 및 설정
		4.4 HttpSession에 SecurityContext 저장
    ↓
5. [Response]
```

### 단계별 설명

**1단계: 사용자 요청 수신**

```java
@PostMapping("/login")
public ResponseEntity login(@RequestBody LoginDto req) {
    // Controller에서 직접 처리
}
```

**2단계: 비즈니스 검증 (LoginService)**

```java
if (user.isLocked()) {
    throw new AccountLockedException("계정이 잠겼습니다.");
}

if (user.isFirstLogin()) {
    return new FirstLoginResponse("비밀번호를 변경하세요.");
}

if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
    user.incrementFailCount();
    if (user.getFailCount() >= 5) {
        user.lock();
    }
    userRepository.save(user);
    throw new BadCredentialsException("아이디 또는 비밀번호 틀렸습니다.");
}
```

**3단계: Spring Security 인증 실행**

```java
// AuthenticationManager를 수동으로 호출
UsernamePasswordAuthenticationToken authToken =
    new UsernamePasswordAuthenticationToken(
        req.getEmail(),
        req.getPassword(),
        user.getAuthorities()
    );
Authentication authentication = authenticationManager.authenticate(authToken);
```

**4단계: 세션 정책 적용**

```java
// SessionAuthenticationStrategy 수동 호출
sessionAuthenticationStrategy.onAuthentication(authentication, request, response);
```

**5단계: SecurityContext 저장**

```java
SecurityContext context = securityContextHolderStrategy.createEmptyContext();
context.setAuthentication(authentication);
SecurityContextHolder.setContext(context);
securityContextRepository.saveContext(context, request, response);
```

---

## 3. 핵심 컴포넌트 구현

### **각 컴포넌트의 역할**

| 컴포넌트                        | 역할                                           | 실무 의미                                           |
| ------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| `HttpSessionEventPublisher`     | 세션 생성/삭제 이벤트를 Spring Security에 전달 | 로그아웃/타임아웃 시 SessionRegistry 자동 정리      |
| `SessionRegistry`               | 세션 및 사용자 상태 관리                       | Admin UI에서 "현재 접속 중인 사용자" 목록 확인 가능 |
| `SessionAuthenticationStrategy` | 세션 정책 체인                                 | 중복 로그인 제어 + 세션 고정 공격 방지 + 세션 등록  |

### 1) User Entity

```java
@Entity
@Table(name = "users")
@EqualsAndHashCode(of = "email", callSuper = false)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User implements UserDetails {
    //...
}
```

#### `equals`/`hashCode`를 오버라이딩 하는 이유

- Spring Security의 `SessionRegistry`는 **동일 사용자의 세션을 추적**하기 위해
- 내부적으로 `Map<Object, Set<SessionInformation>>`을 사용하기 때문에 `equals`/`hashCode`를 오버라이딩해 해야 함

  ```java
  // SessionRegistryImpl 내부
  private final ConcurrentMap> principals = new ConcurrentHashMap<>();

  public void registerNewSession(String sessionId, Object principal) {
  Set sessions = principals.get(principal);
  // 여기서 principal.equals()로 동일 사용자 판단
  }
  ```

- `equals`를 오버라이딩하지 않으면: **객체 참조 비교**로 동작
- SessionRegistry에 같은 사용자가 여러 번 등록되어, 중복 로그인 제어 X

---

### 2) LoginService

#### 1) 로그인 메인 로직

```java
    @Transactional
    public LoginResponse login(LoginDto req, HttpServletRequest request,
                                HttpServletResponse response) {

        // 1. 사용자 조회
        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

        // 2. 계정 잠김 체크
        if (user.isLocked()) {
            throw new AccountLockedException("계정이 잠겼습니다. 관리자에게 문의하세요.");
        }

        // 3. 계정 활성화 체크
        if (!user.isEnabled()) {
            throw new DisabledException("비활성화된 계정입니다.");
        }

        // 4. 비밀번호 검증
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            user.incrementFailCount();
            userRepository.save(user);

            if (user.isLocked()) {
                throw new AccountLockedException(
                    "5회 실패로 계정이 잠겼습니다. 관리자에게 문의하세요."
                );
            }

            throw new BadCredentialsException(
                String.format("아이디 또는 비밀번호가 틀렸습니다. (남은 시도: %d회)",
                              5 - user.getFailCount())
            );
        }

        // 5. 첫 로그인 체크
        if (user.isFirstLogin()) {
            return LoginResponse.firstLogin("비밀번호를 변경해야 합니다.");
        }

        // 6. Spring Security 인증 실행
        performSecurityAuthentication(req, user, request, response);

        // 7. 로그인 성공 처리
        user.resetFailCount();
        userRepository.save(user);

        return LoginResponse.success(user);
    }
```

#### 2) Spring Security 인증 수행

```java
    private void performSecurityAuthentication(LoginDto req, User user,
                                                HttpServletRequest request,
                                                HttpServletResponse response) {

        // 1. AuthenticationManager를 통한 인증
        UsernamePasswordAuthenticationToken authToken =
            new UsernamePasswordAuthenticationToken(
                req.getEmail(),
                req.getPassword(),
                user.getAuthorities()
            );

        Authentication authentication = authenticationManager.authenticate(authToken);

        // 2. SessionAuthenticationStrategy 호출 (세션 정책 적용) → SessionRegistry 등록
        sessionAuthenticationStrategy.onAuthentication(authentication, request, response);

        // 3. SecurityContext 생성 및 설정
        SecurityContext context = securityContextHolderStrategy.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        // 4. SecurityContextRepository에 저장 (HttpSession에 저장됨)
        securityContextRepository.saveContext(context, request, response);
    }
```

---

### 3) SessionConfig - 세션 정책 설정

**1) HttpSessionEventPublisher**

> 세션 생성/삭제 이벤트를 Spring Security에 전달

```java
    public HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher() {
            @Override
            public void sessionCreated(HttpSessionEvent event) {
                super.sessionCreated(event);
            }

            @Override
            public void sessionDestroyed(HttpSessionEvent event) {
                super.sessionDestroyed(event);
            }
        };
    }
```

**2) 서블릿 리스너에 등록 (정상 동작 보장)**

> **(1)HttpSessionEventPublisher**을 ServletListener에 등록해야 로그아웃 시 SessionRegistry에서 세션이 제거됨
> 하지 않을 경우, 세션이 누적

```java
    public ServletListenerRegistrationBean
            httpSessionEventPublisherRegistration() {
        return new ServletListenerRegistrationBean<>(httpSessionEventPublisher());
    }
```

**3) SessionRegistry**

> 세션 및 사용자 상태 관리 핵심 컴포넌트

```java
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl() {
            @Override
            public void registerNewSession(String sessionId, Object principal) {
                super.registerNewSession(sessionId, principal);
            }

            @Override
            public void removeSessionInformation(String sessionId) {
                SessionInformation info = getSessionInformation(sessionId);
                super.removeSessionInformation(sessionId);
            }

            private String extractPrincipalName(Object principal) {
                if (principal instanceof User) {
                    return ((User) principal).getEmail();
                }
                return principal.toString();
            }
        };
    }
```

**4) SessionAuthenticationStrategy**

> 인증 성공 시 작동하는 세션 정책

```java
    public SessionAuthenticationStrategy sessionAuthenticationStrategy(
            SessionRegistry sessionRegistry) {

        // 3-1) 동시 로그인 개수 제한
        ConcurrentSessionControlAuthenticationStrategy concurrentControl =
            new ConcurrentSessionControlAuthenticationStrategy(sessionRegistry);
        concurrentControl.setMaximumSessions(1);  // 동일 계정 1명만
        concurrentControl.setExceptionIfMaximumExceeded(false);  // 기존 세션 만료

        // 3-2) 세션 고정 공격 방지 (세션 ID 재발급)
        SessionFixationProtectionStrategy sessionFixation =
            new SessionFixationProtectionStrategy();
        sessionFixation.setMigrateSessionAttributes(true);

        // 3-3) SessionRegistry에 세션 등록
        RegisterSessionAuthenticationStrategy registerSession =
            new RegisterSessionAuthenticationStrategy(sessionRegistry);

        // 3가지 전략을 Composite로 통합
        return new CompositeSessionAuthenticationStrategy(Arrays.asList(
            concurrentControl,
            sessionFixation,
            registerSession
        ));
    }
```

---

### 4) SecurityFilterChain 설정

> 컨트롤러는 "로그인 시 딱 한 번 실행"되어 "세션 생성 및 전략 수동 호출"함
> 필터는 "로그인 이후 API"에 "세션 유효성 검증 및 정책 담당"

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())  // REST API는 CSRF 불필요

        // SecurityContext 저장 방식 설정
        .securityContext(context -> context
            .securityContextRepository(securityContextRepository())
            .requireExplicitSave(true)  // 명시적 저장 (Controller에서 수동 저장)
        )

        // 세션 관리 설정
        .sessionManagement(session -> session
            .sessionFixation().changeSessionId()  // 세션 고정 공격 방지
            .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            .maximumSessions(1)  // 동일 계정 1명만
            .maxSessionsPreventsLogin(false)  // 기존 세션 만료 방식
            .sessionRegistry(sessionRegistry())
            .expiredSessionStrategy(customSessionExpiredStrategy())  // 만료 시 처리
        )

        // 예외 처리
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint(authenticationDeniedHandler())  // 401
            .accessDeniedHandler(authorizationDeniedHandler())  // 403
        )

        // 커스텀 필터 추가
        .addFilterBefore(sessionExpiredFilter(), SecurityContextPersistenceFilter.class)
        .addFilterBefore(improvedLogoutFilter(), LogoutFilter.class);

    return http.build();
}
```

**주요 설정 설명**

- **requireExplicitSave**
  - 기본값(false)은 SecurityContextPersistenceFilter가 자동 저장
  - true로 설정 시 Controller에서 수동으로 saveContext() 호출 필요
  - true로 변경하지 않으면, SecurityContext가 두 번 저장됨

- **sessionFixation().changeSessionId()**
  - 세션 고정 공격(Session Fixation) 방지
  - 로그인 성공 시 세션 ID를 새로 발급하여 공격자가 탈취한 세션 ID 무효화

---

## 4. 동작 검증

**1) 정상 로그인**

```bash
POST /api/login
{
  "email": "user@example.com",
  "password": "password123"
}

→ 200 OK
{
  "status": "SUCCESS",
  "user": {
    "email": "user@example.com",
    "type": "CUSTOMER"
  }
}
```

**2) 5회 실패 → 계정 잠김**

```bash
# 1~4회 실패
→ 400 Bad Request
{
  "error": "아이디 또는 비밀번호가 틀렸습니다. (남은 시도: 4회)"
}

# 5회 실패
→ 423 Locked
{
  "error": "5회 실패로 계정이 잠겼습니다."
}
```

**3) 첫 로그인**

```bash
POST /api/login
{
  "email": "newuser@example.com",
  "password": "temp123"
}

→ 200 OK
{
  "status": "FIRST_LOGIN",
  "message": "비밀번호를 변경해야 합니다."
}
```

**4) 중복 로그인 제어**

```bash
# 사용자 A: 로그인 성공 (Session ID: abc123)
# 사용자 B: 같은 계정으로 로그인 시도

→ 사용자 A의 세션이 만료됨
→ 사용자 A가 API 호출 시 401 Unauthorized 응답
```

---

## 5. 정리

### 핵심 요약

> JSON 기반 로그인 + 계정 잠금 + 첫 로그인 체크 + ROLE별 응답  
> 이 4가지를 FormLogin 필터에서 처리하기는 너무 복잡해습니다.

**Controller 방식으로 전환한 후:**

- 비즈니스 로직이 Service 레이어에 명확히 분리됨
- Spring Security의 세션 정책은 그대로 활용

### 트레이드오프

- **장점:**
  - 비즈니스 로직 자유도 높음
  - 코드 가독성 좋음

- **단점:**
  - Spring Security의 "자동화"를 포기
  - `SessionAuthenticationStrategy` 수동 호출 필요
  - `SecurityContext` 수동 저장 필요
