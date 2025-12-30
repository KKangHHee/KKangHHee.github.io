### /service/common/LoginService

```java
// 전체 코드
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginService {

    private final CustomUserDetailsService customUserDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final UserMailService mailService;
    private final RedisTemplate<String, String> redisTemplate;
    private final AuthenticationManager authenticationManager;
    private final SessionRegistry sessionRegistry;
    private final SessionAuthenticationStrategy sessionAuthenticationStrategy;
    private final HttpSessionSecurityContextRepository securityContextRepository;
    private final SecurityContextHolderStrategy securityContextHolderStrategy = SecurityContextHolder.getContextHolderStrategy();


    private static final String RESET_REQUIRED_PREFIX = "reset:required:";

    public UserRole authenticateAndLogin(LoginDto req, HttpServletRequest request, HttpServletResponse response) {
        User user = findUserOrThrow(req.getEmail());

        validateUserStatus(user);
        verifyPassword(req.getPassword(), user);
        checkFirstLogin(user);
        updateLoginInfo(user);
        performSecurityAuthentication(req, user, request, response);
        checkPasswordResetRequired(user.getEmail());

        return resolveUserRole(user);
    }

    private User findUserOrThrow(String email) { // 사용자 조회
        try {
            return customUserDetailsService.loadUserByUsername(email);
        } catch (Exception ex) {
            throw new CustomException(ErrorCode.INVALID_USERNAME_OR_PASSWORD);
        }
    }

    private void validateUserStatus(User user) { // 계정 상태 확인
        if (!user.isAccountNonLocked()) {
            throw new CustomException(ErrorCode.ACCOUNT_DISABLED);
        }
    }

    private void verifyPassword(String rawPassword, User user) { // 비밀 번호 검증 및 예외
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            user.incrementFailed();
            user.loginFail();
            userRepository.save(user);
            if (user.getFailedCount() >= 5) {
                throw new CustomException(
                        ErrorCode.ACCOUNT_LOCKED);
            }
            throw new CustomException(ErrorCode.INVALID_USERNAME_OR_PASSWORD);
        }
    }

    private void checkFirstLogin(User user) { // 첫 로그인 확인
        if (user.checkFirstLogin()) {
            throw new CustomException(ErrorCode.FIRST_LOGIN_REQUIRED);
        }
    }


    private void updateLoginInfo(User user) { // 로그인 성공 후의 사용자 정보 업데이트
        user.resetFailedCount();
        user.updateLastLoginAt();
        userRepository.save(user);
        mailService.successLogin(user.getEmail());
    }


    private void performSecurityAuthentication(LoginDto req, User user, HttpServletRequest request, HttpServletResponse response) {
        try {
            // 1. 인증 토큰 생성 및 인증 수행
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword(), user.getAuthorities());

            Authentication authentication = authenticationManager.authenticate(authToken);
            log.debug("[인증 성공] 사용자: {}", user.getEmail());

            // 2. 세션 정책 적용 (중복 세션 제어)
            sessionAuthenticationStrategy.onAuthentication(authentication, request, response);
            log.debug("[세션 정책 적용 완료] 사용자: {}", user.getEmail());

            // 3. SecurityContext 설정
	      SecurityContext context = securityContextHolderStrategy.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            // 4. SecurityContext를 세션에 저장
            securityContextRepository.saveContext(context, request, response);

            HttpSession session = request.getSession(false); // 기존 세션 가져오기 (생성하지 않음)
            String sessionId = session != null ? session.getId() : "Unknown";
            log.info("[인증 완료] 사용자: {}, 세션 ID: {}", user.getEmail(), sessionId);

        } catch (SessionAuthenticationException ex) {
            log.warn("[세션 정책 위반] 사용자: {}, 이유: {}", user.getEmail(), ex.getMessage());
            // Spring Security의 SessionAuthenticationException을 커스텀 예외로 변환
            throw new CustomException(ErrorCode.SESSION_ALREADY_EXISTS);
        } catch (Exception ex) {
            log.error("[인증 실패] 사용자: {}, 이유: {}", user.getEmail(), ex.getMessage(), ex);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // 비밀번호 재설정 필요 여부 확인
    private void checkPasswordResetRequired(String email) {
        if ("true".equals(redisTemplate.opsForValue().get(RESET_REQUIRED_PREFIX + email))) {
            throw new CustomException(ErrorCode.RESET_PASSWORD_REQUIRED);
        }
    }

    // 비밀번호 재설정 플래그
    private void clearPasswordResetFlag(String email) {
        redisTemplate.delete(RESET_REQUIRED_PREFIX + email);
    }

    private UserRole resolveUserRole(User user) {
        return (user.getClient() == null) ? UserRole.ADMIN : UserRole.CLIENT;
    }

    // 사용자 비밀번호 변경
    @Transactional
    public void updateUserPassword(String email, RequestUpdateUserPasswordDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.SAME_AS_OLD_PASSWORD);
        }

        user.changePassword(passwordEncoder.encode(dto.getPassword()));
        user.updateLastLoginAt();
        clearPasswordResetFlag(email);
    }
}
```
