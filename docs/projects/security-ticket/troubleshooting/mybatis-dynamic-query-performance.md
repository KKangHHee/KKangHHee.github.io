---
sidebar_position: 2
title: MyBatis 도입을 통한 복잡한 검색 쿼리 성능 개선
---

# 0. 개요

<aside>

**관리자 페이지의 클라이언트 검색 기능 구현**

---

- **요구사항**:
  1. 다양한 필터링 조건(기간, 권한 계정상태, 키워드(전체, 이메일, 이름, 소속, 부서, 연락처 등) 검색과 정렬 옵션을 지원해야 했습니다.
  2. 번호 기반 페이지네이션 구현

---

- **MyBatis 도입 배경:** 1. 순수 JPA로 시작했으나 조건이 늘어날수록 `Repository`와 `Service`에서 여러 이슈 발생 2. 복잡한 쿼리에서 `JPA Specification`과 `MyBatis`를 검토 후, - 범용 CRUD: `JPA`사용, 복잡 검색: `MyBatis`사용 (동적 SQL 최적화, COUNT 쿼리 개선) - 하이브리드 전략 채택으로 성능 개선 3. `JPA Specification`와 비교 시, 평균 응답시간을 약 36% **향상** (avg: 24.45 → 15.51ms)
</aside>

---

# 1. 구현 과정

## 1단계) 순수 JPA

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Page<User> findByClientCompanyNameContaining(String companyName, Pageable pageable);
    Page<User> findByLastLoginAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
		...
}
```

- 일반적인 페이지네이션이 아닌 필터링 조건마다
  1. Repository의 메서드 증가
  2. Service의 분기 처리 복잡
     ⇒ 가독성과 유지보수성의 저하

---

## 2단계 Native Query

[코드](/docs/projects/bargain-hunter/troubleshooting/code_Native-Query)

- 문제점
  1. DB 종속
  2. 동적 조건 처리(`IS NULL OR`)로 인한 실행 계획 비효율 + 조건 추가에 따른 복잡성 증가
  3. 복잡한 SQL 문자열 관리의 어려움

---

## 3단계 JPA Specification

[코드](/docs/projects/bargain-hunter/troubleshooting/code_JPA-Specification)

```java
// Specification 사용을 위해 상속만 추가
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
}
```

```java
public class UserSpecification {
    public static Specification<User> filterClients(
            LocalDate startDate,
            LocalDate endDate,
            String range,
            String keyword) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
	...
}
```

- **장점**: ORM 일관성 유지, N+1 해결
  - `root.join()`으로 명시한 연관 엔티티들이 한 번에 로드됨 (Fetch Join 효과)
  - 한 번의 쿼리로 User, Client, Company를 모두 로드
  - DTO 변환 시 이미 메모리에 있는 데이터 사용 → 추가 쿼리 없음
- **단점**: Java와 SQL 로직 혼재 → 가독성, 튜닝 난이도 높음

<aside>

### 테스트 조건:

---

- JMeter 테스트(10명 동시 접속, 50회 요청/`GET /admin/clients` )
- 데이터: Compony(10개), User(1050) = Clients(1000명) + Admin(50) - CSV 내 검색 키워드 입력(`Search`) - 날짜 필터링(`Date Filter`) - 기본 페이지네이션/필터없음(`Basic`) - 복합 필터(날짜 + 검색 + 정렬/`Complex Filter`)
</aside>

**JPA Specification 테스트 결과**

| 구분                                | 평균 응답시간(ms) | 최대(ms) | 처리량(TPS) |
| ----------------------------------- | ----------------- | -------- | ----------- |
| GET /admin/clients - Search         | 20.99             | 77.33    | 55.93       |
| GET /admin/clients - Date Filter    | 15.86             | 44.00    | 55.96       |
| GET /admin/clients - Basic          | 39.99             | 81.67    | 55.64       |
| GET /admin/clients - Complex Filter | 20.95             | 75.00    | 55.30       |
| Total                               | 24.45             | 83.67    | 221.77      |

---

## 4단계) MyBatis

> • SQL과 JAVA코드 분리를 통해 쿼리 가독성 향상 및 향후 확장에 유리
> • Criteria보다 SQL 위주로 필요한 컬럼만 콜라서 뽑을 수 있음

### (1) MyBatis 초기 버전

[코드](https://www.notion.so/MyBatis-2ab1741ed72e8021b2eaca272aa37ad8?pvs=21)

**MyBatis - 개선 전 테스트 결과**

| 구분                                | 평균 응답시간(ms) | 최대(ms) | 처리량(TPS) |
| ----------------------------------- | ----------------- | -------- | ----------- |
| GET /admin/clients - Search         | 24.04             | 108      | 59.15       |
| GET /admin/clients - Date Filter    | 23.39             | 92       | 59.34       |
| GET /admin/clients - Basic          | 23.85             | 473      | 57.59       |
| GET /admin/clients - Complex Filter | 23.46             | 112      | 59.32       |
| Total                               | 24.56             | 473      | 66.70       |

- 문제점
  - 동적 SQL을 `<if>` + `<choose>` 로 처리
  - 가독성 향상은 있었으나 캐시 효율 및 성능 저하 발생
  ***
  - 최대 응답시간 편차 큼 (83.67 → 473ms)
  - 처리량 3배 감소 (221.77 → 66.7TPS)
  - SQL 템플릿이 자주 변해 DB 캐시 비효율 발생

---

### (2) MyBatis 개선

[코드](https://www.notion.so/MyBatis-2ab1741ed72e8031bf0ffc20a5d6d824?pvs=21)

<aside>

### 개선 내용

---

1. 동적 SQL 최적화
   - `<choose>` 중첩(매번 sql구문을 다르게 생성) → 제거
   - OR 조건 기반으로 통합 → 쿼리 템플릿 고정화
   - SQL 캐시 효율 향상
2. COUNT 쿼리 최적화

   - `countFilteredClients` 내 `JOIN` → `EXISTS` 서브쿼리 기반으로 전환
   - 불필요한 조인 제거 및 조기 종료 가능
     - `JOIN` 후 `COUNT(*)` :모든 조인 결과를 계산, 임시 테이블을 만든 후 → 최종 카운트 계산
     - `EXISTS`는 조건 만족 시 첫 번째 행에서 검색 중지 → 불필요한 조인 연산 제거

   ```java
   OR EXISTS (
   	SELECT 1 FROM clients c
   	WHERE c.client_id = u.client_id
   	AND c.phone_number LIKE CONCAT('%', #{keyword}, '%')
   )...
   ```

</aside>

**MyBatis 개선 후 테스트 결과**

| Transaction                         | 평균 응답시간(ms) | 최대(ms) | 처리량(TPS) |
| ----------------------------------- | ----------------- | -------- | ----------- |
| GET /admin/clients - Search         | 17.16             | 48       | 68.95       |
| GET /admin/clients - Date Filter    | 15.89             | 32       | 68.99       |
| GET /admin/clients - Basic          | 17.23             | 54       | 68.64       |
| GET /admin/clients - Complex Filter | 17.11             | 48       | 69.02       |
| Total                               | 15.51             | 54       | 273.34      |

---

# 2. 성능 비교 및 분석

![그림1.png](attachment:7ecdd753-fa8e-42af-b9f3-0dbb6fdf6c61:그림1.png)

<aside>

### 개선 효과

---

1. MyBatis 개선 전 대비

   > 쿼리 구조 단순화 및 **불필요한 JOIN 제거** 및 **SQL 캐시 효율 증가**
   > DB 부하 감소 효과를 통한 개선

   - 평균 응답시간 **36.8% 감소** (24.56 → 15.51ms)
   - 최대 응답시간 **88.5% 감소** (473 → 54ms)
   - 처리량 **3.9배 증가** (66.7 → 273TPS)

---

1. JPA Specification 대비 - 평균 응답시간 **약 35% 감소** - 최대 응답시간 **35% 개선** (83.67 → 54ms) - Basic 요청 기준 **2.3배 빠름** (39.99 → 17.23ms) - 처리량 **약 23% 향상** (221.77 → 273TPS)
</aside>

---

# 3. 결론

<aside>

**하이브리드 방법 채택**

---

- **JPA 사용**: 기본 CRUD, 단순 조회, 엔티티 관계 활용이 필요한 경우
- **MyBatis 사용**: 복잡한 조건 조합, 다중 조인, 복잡한 검색
</aside>

<aside>

**결론**

---

복잡한 검색 기능에서 JPA Specification의 가독성 문제를 MyBatis로 해결하고, 단순 CRUD는 JPA를 유지하는 하이브리드 전략으로 **개발 생산성과 쿼리 성능을 모두 확보**했습니다.

특히, COUNT 쿼리를 EXISTS 패턴으로 변경하고 동적 SQL을 단순화하여 최대 응답시간을 절반 이하로 줄였습니다.

</aside>
