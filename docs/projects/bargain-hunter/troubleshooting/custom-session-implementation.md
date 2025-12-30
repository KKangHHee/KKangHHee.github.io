# 0. 개요

<aside>

**Session 기반 인증 인가 구현**

---

- **서버 환경:** Admin/Customer 통합 모놀리틱 환경
- **요구사항:**
  1. **세션 기반 인증 구현** (JSON 기반 로그인)
  2. **동시 로그인 제한(중복 로그인 제어)**

---

- **커스텀 세션 인증 구현 배경**
  1. 표준 FormLogin 필터로 처리 어려운 _계정 잠금, 실패 횟수 증가, 첫 로그인 체크_ 등 비즈니스 로직 반영 필요
  2. **Admin/Customer 타입별 커스텀 응답 필요**

---

- **해결 방안** 1. 필터 대신 **Controller + SessionAuthenticationStrategy 조합**으로 커스텀 인증 구현 2. Spring Security의 세션 정책(세션 고정 공격 방지, 중복 로그인 제어 등)을 **수동으로 호출·적용(heap stack 방식)**
</aside>

---

# 1. 구현 과정

## 1-1 인증 플로우

```bash
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
				4.2.1 중복 세션 제어 | 세션 고정 공격 방지 |
				4.2.2 SessionRegistry 등록
		4.3 SecurityContext 생성 및 설정
		4.4 HttpSession에 SecurityContext 저장
    ↓
5. [Response]
```

---

## 1-2 구조 설계

| 구성요소                        | 역할                                         |
| ------------------------------- | -------------------------------------------- |
| `LoginController`               | 사용자 요청 수신, 비즈니스 검증 및 인증 실행 |
| `LoginService`                  | 사용자 검증, 계정 상태 확인, 세션 등록 처리  |
| `SessionAuthenticationStrategy` | 세션 중복 로그인 제어 및 보안 정책 적용      |
| `SecurityContextRepository`     | 인증 정보의 세션 저장소 관리                 |

---

## 1-3 Entity 생성

- `security.core`의 `userdetails`를 구현하는 `User` Entity를 생성하여, 인증/인가에 대한 객체 생성
- 이때, 요구사항인, 비밀번호 재설정, 로그인 5회 실패 시, 잠김, 첫로그인 체크, 계정 비활성화, 고객과 관리자 역할 설정 등 명시
- 커스텀 세션을 이용할 것이므로 Spring의 요구에 따라 equals와 hashCode를 오버라이딩
  ```java
  // Lombok을 통해 간략하게 구현
  @EqualsAndHashCode(of = "email", callSuper = false)
  ...
  @Column(nullable = false, unique = true)
  private String email;  // 이메일, 고유 식별자로 사용
  ```
- User를 조회하는 `userdetailsService`를 구현하는 `CustomUserDetailsService`생성

---

## 1-4 로직 구현

> Spring 공식 문서를 참고하여 작성

### (1) Service

[spring-security/ference](https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html)

[전체코드](https://www.notion.so/LoginService-2ab1741ed72e80b5a2aee782210f32e4?pvs=21)

```java
// /service/common/LoginService
public class LoginService {
	...
		private void performSecurityAuthentication(LoginDto req, User user,
	    HttpServletRequest request, HttpServletResponse response) {
	    ...
	    	// 1. AuthenticationManager를 통한 인증
		    UsernamePasswordAuthenticationToken authToken =
		        new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword(), user.getAuthorities());
		    Authentication authentication = authenticationManager.authenticate(authToken);

		    // 2. SessionAuthenticationStrategy 호출 (세션 정책 적용)
		    sessionAuthenticationStrategy.onAuthentication(authentication, request, response);

		    // 3. SecurityContext 생성 및 설정
	      SecurityContext context = securityContextHolderStrategy.createEmptyContext();
		    context.setAuthentication(authentication);
		    SecurityContextHolder.setContext(context);

		    // 4. SecurityContextRepository에 저장
		    securityContextRepository.saveContext(context, request, response);
		   ...
	  }
	}
```

→ 컨트롤러 호출 이후 서비스 레이어에서 Spring Security 흐름을 직접 구성.

---

### (2) SessionConfig - session 설정

[전체 코드](https://www.notion.so/SessionConfig-2ab1741ed72e80749604ed51933c5687?pvs=21)

```java
public HttpSessionEventPublisher httpSessionEventPublisher() {
	return new HttpSessionEventPublisher() { ... };
 }

public ServletListenerRegistrationBean<HttpSessionEventPublisher> httpSessionEventPublisherRegistration() {
	return new ServletListenerRegistrationBean<>(httpSessionEventPublisher());
 }

public SessionRegistry sessionRegistry() {
	return new SessionRegistryImpl() { ... };
}
```

```java
public SessionAuthenticationStrategy sessionAuthenticationStrategy(
	SessionRegistry sessionRegistry) { ... }

```

<aside>

**1 HttpSessionEventPublisher**

---

- 세션 **생성/삭제 이벤트**를 감지하여 Spring Security에게 전달
- `ServletListenerRegistrationBean`을 통해 서블릿 리스너에 등록 (정상 동작 보장)
- 이벤트 흐름
  **세션 이벤트 → SecurityContext 처리 → SessionRegistry 반영**

</aside>

<aside>

**2 SessionRegistry**

---

- 세션 및 사용자 상태 관리 핵심 컴포넌트
- 로그인 시 → `registerNewSession()`으로 세션 등록
- 로그아웃/세션 만료 시 → `removeSessionInformation()`으로 정리
- `extractPrincipalName()` 기반 사용자 식별 → 로깅 및 관리자 UI에서 활용
</aside>

<aside>

**3 SessionAuthenticationStrategy**

---

- 인증 성공 시 작동하는 세션 정책 체인
- `ConcurrentSessionControl` → **동시 로그인 개수 제한**
- `SessionFixationProtection` → **세션 ID 재발급**
- `RegisterSessionAuthentication` → **SessionRegistry에 세션 등록**
- 위 3가지 전략을 **Composite 전략으로 통합 구성**
</aside>

---

### (3) SecurityFilterChain 설정

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.cors(cors -> cors.configurationSource(corsConfigurationSource))
				...
        .securityContext(context -> context
            .securityContextRepository(securityContextRepository())
            .requireExplicitSave(true)
        )
        .sessionManagement(session -> session
            .sessionFixation().changeSessionId()
            .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            .maximumSessions(1)
            .maxSessionsPreventsLogin(false)
            .sessionRegistry(sessionRegistry)
            .expiredSessionStrategy(customSessionExpiredStrategy)
        )
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint(authenticationDeniedHandler)
            .accessDeniedHandler(authorizationDeniedHandler)
        )
        .addFilterBefore(sessionExpiredFilter(), SecurityContextPersistenceFilter.class)
        .addFilterBefore(improvedLogoutFilter(), LogoutFilter.class);

    return http.build();
}
```

---

# 2. 결과 및 성과

<aside>

### 2-1. 구현 효과

---

- JSON 기반 **커스텀 로그인 API 완성**
- 표준 Form 방식으로 구현이 어려웠던 로직을 서비스 레이어에서 유연하게 처리
- Spring Security의 세션 통제 정책을 **수동 호출 방식으로 우회**
- Admin/Customer 활성 세션 UI 확인 가능(`SessionRegistry`활용)
</aside>
