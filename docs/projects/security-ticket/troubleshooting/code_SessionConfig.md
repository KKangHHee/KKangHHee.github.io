### /config/SessionConfig

```java
@Configuration
public class SessionConfig {
	...
    @Bean
    public HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher() {
            @Override
            public void sessionCreated(HttpSessionEvent event) {
                String sessionId = event.getSession().getId();
                event.getSession().setMaxInactiveInterval(sessionTimeout);
            }

            @Override
            public void sessionDestroyed(HttpSessionEvent event) {
                String sessionId = event.getSession().getId();
            }
        };
    }

    /**
     * HttpSessionEventPublisher 등록 (SessionRegistry 동작 보장)
     */
    @Bean
    public ServletListenerRegistrationBean<HttpSessionEventPublisher> httpSessionEventPublisherRegistration() {
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
            }

            @Override
            public void removeSessionInformation(String sessionId) {
                super.removeSessionInformation(sessionId);
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
    public SessionAuthenticationStrategy sessionAuthenticationStrategy(SessionRegistry sessionRegistry) {
        // 중복 로그인 제어
        ConcurrentSessionControlAuthenticationStrategy concurrentStrategy =
                new ConcurrentSessionControlAuthenticationStrategy(sessionRegistry);
        concurrentStrategy.setMaximumSessions(maxSessionsPerUser);
        concurrentStrategy.setExceptionIfMaximumExceeded(preventLoginWhenExceeded);

        // 세션 고정 공격 방지
        SessionFixationProtectionStrategy fixationStrategy = new SessionFixationProtectionStrategy();

        // 세션 등록
        RegisterSessionAuthenticationStrategy registerStrategy =
                new RegisterSessionAuthenticationStrategy(sessionRegistry);

        // 전략 통합
        CompositeSessionAuthenticationStrategy compositeStrategy = new CompositeSessionAuthenticationStrategy(
                List.of(
                        concurrentStrategy,
                        fixationStrategy,
                        registerStrategy
                )
        );
        return compositeStrategy;
    }
}
```
