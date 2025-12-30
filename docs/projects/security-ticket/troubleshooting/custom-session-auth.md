---
sidebar_position: 2
title: 커스텀 세션 인증 구현
---

# Spring Security 커스텀 세션 인증 구현

> Controller + SessionAuthenticationStrategy 조합으로 비즈니스 로직 통합

---

## 0. 개요

:::danger 문제 상황

- **서버 환경**: Admin/Customer 통합 모놀리틱 환경
- **요구사항**:
  1. JSON 기반 로그인 (표준 FormLogin 필터 사용 불가)
  2. 동시 로그인 제한 (중복 로그인 제어)
  3. 계정 잠금, 실패 횟수 증가, 첫 로그인 체크 등 비즈니스 로직 반영
  4. Admin/Customer 타입별 커스텀 응답 필요
     :::

:::tip 해결 방향

- 필터 대신 **Controller + Service 레이어**에서 인증 처리
- `SessionAuthenticationStrategy`를 **수동 호출**하여 세션 정책 적용
- Spring Security의 세션 통제 정책을 **heap stack 방식**으로 우회
  :::

---

## 1. 구현 과정

### 1-1) 인증 플로우

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
        4.2.1 중복 세션 제어
        4.2.2 세션 고정 공격 방지
        4.2.3 SessionRegistry 등록
    4.3 SecurityContext 생성 및 설정
    4.4 HttpSession에 SecurityContext 저장
    ↓
5. [Response]
```

---

### 1-2) 구조 설계

| 구성요소                        | 역할                                         |
| ------------------------------- | -------------------------------------------- |
| `LoginController`               | 사용자 요청 수신, 비즈니스 검증 및 인증 실행 |
| `LoginService`                  | 사용자 검증, 계정 상태 확인, 세션 등록 처리  |
| `SessionAuthenticationStrategy` | 세션 중복 로그인 제어 및 보안 정책 적용      |
| `SecurityContextRepository`     | 인증 정보의 세션 저장소 관리                 |

---

### 1-3) Entity 생성

```java
@Entity
@Table(name = "users")
@EqualsAndHashCode(of = "email", callSuper = false)  // 커스텀 세션 요구사항
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;  // 고유 식별자

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column
    private LocalDateTime lastLoginAt;

    @Column(nullable = false)
    private int failedCount = 0;  // 로그인 실패 횟수

    @Column(nullable = false)
    private boolean isFirstLogin = true;  // 첫 로그인 여부

    @Column(nullable = false)
    private boolean isAccountNonLocked = true;  // 계정 잠금 여부

    @Enumerated(EnumType.STRING)
    private UserRole role;  // ADMIN, CLIENT

    // UserDetails 구현
    @Override
    public Collection getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isAccountNonLocked;
    }

    // 비즈니스 로직
    public void incrementFailed() {
        this.failedCount++;
        if (this.failedCount >= 5) {
            this.isAccountNonLocked = false;
        }
    }

    public void resetFailedCount() {
        this.failedCount = 0;
    }

    public void updateLastLoginAt() {
        this.lastLoginAt = LocalDateTime.now();
    }

    public boolean checkFirstLogin() {
        return this.isFirstLogin;
    }
}
```

---

### 1-4) LoginService 구현

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class LoginService {

    private final CustomUserDetailsService customUserDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final SessionAuthenticationStrategy sessionAuthenticationStrategy;
    private final HttpSessionSecurityContextRepository securityContextRepository;
    private final SecurityContextHolderStrategy securityContextHolderStrategy =
        SecurityContextHolder.getContextHolderStrategy();

    public UserRole authenticateAndLogin(
        LoginDto req,
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        // 1. 사용자 조회
        User user = findUserOrThrow(req.getEmail());

        // 2. 계정 상태 확인
        validateUserStatus(user);

        // 3. 비밀번호 검증
        verifyPassword(req.getPassword(), user);

        // 4. 첫 로그인 확인
        checkFirstLogin(user);

        // 5. 로그인 정보 업데이트
        updateLoginInfo(user);

        // 6. Spring Security 인증 수행
        performSecurityAuthentication(req, user, request, response);

        // 7. 사용자 역할 반환 (Admin/Customer 구분)
        return resolveUserRole(user);
    }

    private User findUserOrThrow(String email) {
        try {
            return customUserDetailsService.loadUserByUsername(email);
        } catch (Exception ex) {
            throw new CustomException(ErrorCode.INVALID_USERNAME_OR_PASSWORD);
        }
    }

    private void validateUserStatus(User user) {
        if (!user.isAccountNonLocked()) {
            throw new CustomException(ErrorCode.ACCOUNT_LOCKED);
        }
    }

    private void verifyPassword(String rawPassword, User user) {
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            user.incrementFailed();
            user.loginFail();
            userRepository.save(user);

            if (user.getFailedCount() >= 5) {
                throw new CustomException(ErrorCode.ACCOUNT_LOCKED);
            }

            throw new CustomException(ErrorCode.INVALID_USERNAME_OR_PASSWORD);
        }
    }

    private void checkFirstLogin(User user) {
        if (user.checkFirstLogin()) {
            throw new CustomException(ErrorCode.FIRST_LOGIN_REQUIRED);
        }
    }

    private void updateLoginInfo(User user) {
        user.resetFailedCount();
        user.updateLastLoginAt();
        userRepository.save(user);
    }

    /**
     * Spring Security 인증 플로우 수동 제어
     */
    private void performSecurityAuthentication(
        LoginDto req,
        User user,
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        try {
            // 1. AuthenticationManager를 통한 인증
            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                    req.getEmail(),
                    req.getPassword(),
                    user.getAuthorities()
                );

            Authentication authentication = authenticationManager.authenticate(authToken);
            log.debug("[인증 성공] 사용자: {}", user.getEmail());

            // 2. SessionAuthenticationStrategy 호출 (세션 정책 적용)
            sessionAuthenticationStrategy.onAuthentication(
                authentication,
                request,
                response
            );
            log.debug("[세션 정책 적용 완료] 사용자: {}", user.getEmail());

            // 3. SecurityContext 생성 및 설정
            SecurityContext context = securityContextHolderStrategy.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            // 4. SecurityContext를 세션에 저장
            securityContextRepository.saveContext(context, request, response);

            HttpSession session = request.getSession(false);
            String sessionId = session != null ? session.getId() : "Unknown";
            log.info("[인증 완료] 사용자: {}, 세션 ID: {}", user.getEmail(), sessionId);

        } catch (SessionAuthenticationException ex) {
            log.warn("[세션 정책 위반] 사용자: {}, 이유: {}", user.getEmail(), ex.getMessage());
            throw new CustomException(ErrorCode.SESSION_ALREADY_EXISTS);
        } catch (Exception ex) {
            log.error("[인증 실패] 사용자: {}, 이유: {}", user.getEmail(), ex.getMessage(), ex);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    private UserRole resolveUserRole(User user) {
        return (user.getClient() == null) ? UserRole.ADMIN : UserRole.CLIENT;
    }
}
```

---

### 1-5) SessionConfig 설정

```java
@Configuration
public class SessionConfig {

    @Value("${server.servlet.session.timeout}")
    private int sessionTimeout;

    /**
     * 세션 이벤트를 Spring Security에게 전달
     */
    @Bean
    public HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher() {
            @Override
            public void sessionCreated(HttpSessionEvent event) {
                String sessionId = event.getSession().getId();
                event.getSession().setMaxInactiveInterval(sessionTimeout);
                log.info("[세션 생성] sessionId: {}", sessionId);
            }

            @Override
            public void sessionDestroyed(HttpSessionEvent event) {
                String sessionId = event.getSession().getId();
                log.info("[세션 만료] sessionId: {}", sessionId);
            }
        };
    }

    /**
     * HttpSessionEventPublisher 등록 (SessionRegistry 동작 보장)
     */
    @Bean
    public ServletListenerRegistrationBean
        httpSessionEventPublisherRegistration() {
        return new ServletListenerRegistrationBean<>(httpSessionEventPublisher());
    }

    /**
     * 활성 세션 추적 및 관리
     */
    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl() {
            @Override
            public void registerNewSession(String sessionId, Object principal) {
                super.registerNewSession(sessionId, principal);
                log.info("[세션 등록] sessionId: {}, principal: {}",
                         sessionId, extractPrincipalName(principal));
            }

            @Override
            public void removeSessionInformation(String sessionId) {
                super.removeSessionInformation(sessionId);
                log.info("[세션 제거] sessionId: {}", sessionId);
            }

            private String extractPrincipalName(Object principal) {
                if (principal instanceof User user) {
                    return user.getEmail();
                }
                return principal != null ? principal.toString() : "anonymous";
            }
        };
    }

    /**
     * 복합 세션 인증 전략 설정
     * - 중복 로그인 제어
     * - 세션 고정 공격 방지
     * - 세션 레지스트리 등록
     */
    @Bean
    public SessionAuthenticationStrategy sessionAuthenticationStrategy(
        SessionRegistry sessionRegistry
    ) {
        // 중복 로그인 제어
        ConcurrentSessionControlAuthenticationStrategy concurrentStrategy =
            new ConcurrentSessionControlAuthenticationStrategy(sessionRegistry);
        concurrentStrategy.setMaximumSessions(1);  // 단일 세션만 허용
        concurrentStrategy.setExceptionIfMaximumExceeded(false);  // 이전 세션 만료

        // 세션 고정 공격 방지
        SessionFixationProtectionStrategy fixationStrategy =
            new SessionFixationProtectionStrategy();

        // 세션 등록
        RegisterSessionAuthenticationStrategy registerStrategy =
            new RegisterSessionAuthenticationStrategy(sessionRegistry);

        // 전략 통합
        return new CompositeSessionAuthenticationStrategy(
            List.of(
                concurrentStrategy,
                fixationStrategy,
                registerStrategy
            )
        );
    }
}
```

---

### 1-6) SecurityFilterChain 설정

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        SessionRegistry sessionRegistry
    ) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .securityContext(context -> context
                .securityContextRepository(securityContextRepository())
                .requireExplicitSave(true)
            )
            .sessionManagement(session -> session
                .sessionFixation().changeSessionId()  // 세션 ID 재발급
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)  // 단일 세션
                .maxSessionsPreventsLogin(false)  // 이전 세션 만료
                .sessionRegistry(sessionRegistry)
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authenticationDeniedHandler)
                .accessDeniedHandler(authorizationDeniedHandler)
            );

        return http.build();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }
}
```

---

## 2. 핵심 컴포넌트 설명

### 1️⃣ HttpSessionEventPublisher

- 세션 **생성/삭제 이벤트**를 감지하여 Spring Security에게 전달
- `ServletListenerRegistrationBean`을 통해 서블릿 리스너에 등록 (정상 동작 보장)
- **이벤트 흐름**: 세션 이벤트 → SecurityContext 처리 → SessionRegistry 반영

### 2️⃣ SessionRegistry

- 세션 및 사용자 상태 관리 핵심 컴포넌트
- 로그인 시 → `registerNewSession()`으로 세션 등록
- 로그아웃/세션 만료 시 → `removeSessionInformation()`으로 정리
- `extractPrincipalName()` 기반 사용자 식별 → 로깅 및 관리자 UI에서 활용

### 3️⃣ SessionAuthenticationStrategy

- 인증 성공 시 작동하는 세션 정책 체인
- `ConcurrentSessionControl` → **동시 로그인 개수 제한**
- `SessionFixationProtection` → **세션 ID 재발급**
- `RegisterSessionAuthentication` → **SessionRegistry에 세션 등록**
- 위 3가지 전략을 **Composite 전략으로 통합 구성**

---

## 3. 구현 효과

:::success 성과

- JSON 기반 **커스텀 로그인 API 완성**
- 표준 Form 방식으로 구현이 어려웠던 로직을 **서비스 레이어에서 유연하게 처리**
- Spring Security의 세션 통제 정책을 **수동 호출 방식으로 우회**
- Admin/Customer **활성 세션 UI 확인 가능** (`SessionRegistry` 활용)
  :::

:::tip 배운 점

- **Spring Security 내부 동작 이해**
- **표준 필터 체인을 벗어난 커스텀 인증 구현** 경험
- **SessionAuthenticationStrategy 수동 호출**의 활용
- **비즈니스 로직과 인증 로직의 통합** 전략
  :::

---

## 4. 추가 고려사항

### 관리자 UI: 활성 세션 조회

```java
@RestController
@RequestMapping("/api/admin/sessions")
public class SessionController {

    private final SessionRegistry sessionRegistry;

    @GetMapping
    public ResponseEntity<List> getActiveSessions() {
        List sessions = sessionRegistry.getAllPrincipals().stream()
            .flatMap(principal -> sessionRegistry.getAllSessions(principal, false).stream())
            .map(sessionInfo -> new SessionInfo(
                sessionInfo.getSessionId(),
                ((User) sessionInfo.getPrincipal()).getEmail(),
                sessionInfo.getLastRequest()
            ))
            .toList();

        return ResponseEntity.ok(sessions);
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity expireSession(@PathVariable String sessionId) {
        SessionInformation sessionInfo = sessionRegistry.getSessionInformation(sessionId);
        if (sessionInfo != null) {
            sessionInfo.expireNow();
        }
        return ResponseEntity.ok().build();
    }
}
```

---

## 5. 참고 자료

- [Spring Security - Session Management](https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html)
- [Spring Security - Concurrent Session Control](https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html#ns-concurrent-sessions)
