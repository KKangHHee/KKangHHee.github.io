---
sidebar_position: 1
title: MyBatis 검색 쿼리 최적화 (36% 개선)
---

# 복합 검색 성능 36% 개선 (JPA → MyBatis)

> 동적 SQL 최적화 + EXISTS 서브쿼리로 **평균 응답시간 24.45ms → 15.51ms**

---

## 0. 개요

:::danger 문제 상황

- **요구사항**: 다양한 필터링 조건 (기간, 키워드 6종, 정렬)
- **JPA Specification 사용 시**: Java와 SQL 로직 혼재, 가독성 저하, 튜닝 어려움
- **MyBatis 초기 버전**: 동적 SQL 구조 문제로 성능 저하 (최대 473ms)
  :::

:::tip 해결 방향

- MyBatis 동적 SQL로 **가독성 확보**
- `<choose>` 중첩 제거 → **OR 조건 기반 통합**
- COUNT 쿼리를 **EXISTS 서브쿼리**로 변경
- SQL 캐시 효율 향상
  :::

---

## 1. 문제 분석

### 요구사항: 관리자 페이지 회원 검색

| 필터 조건        | 옵션                                        |
| ---------------- | ------------------------------------------- |
| **기간 필터**    | 최근 로그인 날짜 범위                       |
| **키워드 검색**  | 전체 / 이메일 / 이름 / 소속 / 부서 / 연락처 |
| **정렬**         | 최근 로그인 순 / 이름 순                    |
| **페이지네이션** | 번호 기반 (10개씩)                          |

**테스트 조건**

- JMeter: 동시 사용자 10명, 각 50회 요청
- 데이터: Company 10개, User 1050개 (Clients 1000명 + Admin 50명)
- 4가지 시나리오: Basic(필터 없음), Date Filter, Search, Complex Filter

---

## 2. 구현 과정

### 1단계) 순수 JPA

```java
public interface UserRepository extends JpaRepository {
    Page findByClientCompanyNameContaining(String companyName, Pageable pageable);
    Page findByLastLoginAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
    // 필터링 조건마다 메서드 증가 → 가독성 저하
}
```

**문제점**

- Repository 메서드 증가
- Service 분기 처리 복잡
- 조건 조합에 따른 메서드 폭발

---

### 2단계) Native Query

```java
@Query(value = """
    SELECT u.*, c.*, co.*
    FROM user u
    LEFT JOIN client c ON u.client_id = c.client_id
    LEFT JOIN company co ON c.company_id = co.company_id
    WHERE (:keyword IS NULL OR co.name LIKE CONCAT('%', :keyword, '%'))
      AND (:startDate IS NULL OR u.last_login_at >= :startDate)
    ORDER BY u.last_login_at DESC
    """, nativeQuery = true)
Page searchClients(...);
```

**문제점**

- DB 종속 (MySQL 전용)
- 동적 조건 처리 (`IS NULL OR`) 비효율
- 실행 계획 최적화 어려움

---

### 3단계) JPA Specification

```java
public static Specification filterClients(
    LocalDate startDate,
    LocalDate endDate,
    String range,
    String keyword
) {
    return (root, query, criteriaBuilder) -> {
        List predicates = new ArrayList<>();

        // Client가 있는 User만
        predicates.add(criteriaBuilder.isNotNull(root.get("client")));

        // 날짜 필터
        if (startDate != null && endDate != null) {
            predicates.add(criteriaBuilder.between(
                root.get("lastLoginAt"),
                startDateTime,
                endDateTime
            ));
        }

        // 키워드 검색
        if ("all".equals(range)) {
            Join clientJoin = root.join("client");
            Join companyJoin = clientJoin.join("company");

            predicates.add(criteriaBuilder.or(
                criteriaBuilder.like(root.get("email"), "%" + keyword + "%"),
                criteriaBuilder.like(root.get("name"), "%" + keyword + "%"),
                criteriaBuilder.like(companyJoin.get("name"), "%" + keyword + "%")
            ));
        }

        return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
    };
}
```

**장점**

- ✅ ORM 일관성 유지
- ✅ N+1 해결 (root.join() Fetch Join 효과)

**단점**

- ❌ Java와 SQL 로직 혼재 → 가독성 저하
- ❌ 쿼리 튜닝 어려움

**테스트 결과**

| 구분           | 평균 응답시간(ms) | 최대(ms)  | 처리량(TPS) |
| -------------- | ----------------- | --------- | ----------- |
| Basic          | 39.99             | 81.67     | 55.64       |
| Date Filter    | 15.86             | 44.00     | 55.96       |
| Search         | 20.99             | 77.33     | 55.93       |
| Complex Filter | 20.95             | 75.00     | 55.30       |
| **Total**      | **24.45**         | **83.67** | **221.77**  |

---

### 4단계) MyBatis (초기 버전)

```xml
 중첩 사용 -->

  SELECT u.*, c.*, co.*
  FROM user u
  LEFT JOIN client c ON u.client_id = c.client_id
  LEFT JOIN company co ON c.company_id = co.company_id
  WHERE u.client_id IS NOT NULL




        AND (
          u.email LIKE CONCAT('%', #{keyword}, '%')
          OR u.name LIKE CONCAT('%', #{keyword}, '%')
          OR co.name LIKE CONCAT('%', #{keyword}, '%')
        )


        AND u.email LIKE CONCAT('%', #{keyword}, '%')





```

**테스트 결과**

| 구분           | 평균 응답시간(ms) | 최대(ms) | 처리량(TPS) |
| -------------- | ----------------- | -------- | ----------- |
| Basic          | 23.85             | **473**  | 57.59       |
| Date Filter    | 23.39             | 92       | 59.34       |
| Search         | 24.04             | 108      | 59.15       |
| Complex Filter | 23.46             | 112      | 59.32       |
| **Total**      | **24.56**         | **473**  | **66.70**   |

**문제점**

- ❌ `<choose>` 중첩으로 매번 SQL 구문 다르게 생성
- ❌ SQL 템플릿이 자주 변해 DB 캐시 비효율
- ❌ 최대 응답시간 편차 큼 (473ms)

---

## 3. 최종 해결: MyBatis 최적화

### 핵심 개선 1: 동적 SQL 단순화

```xml
 ## 중첩 (SQL 캐시 비효율) -->
      AND (u.email LIKE ... OR u.name LIKE ...)
      ...
      AND u.email LIKE ...

  AND (
    (#{range} = 'all' AND (
      u.email LIKE CONCAT('%', #{keyword}, '%')
      OR u.name LIKE CONCAT('%', #{keyword}, '%')
      OR u.department LIKE CONCAT('%', #{keyword}, '%')
    ))
    OR (#{range} = 'email' AND u.email LIKE CONCAT('%', #{keyword}, '%'))
    OR (#{range} = 'name' AND u.name LIKE CONCAT('%', #{keyword}, '%'))
    OR (#{range} = 'department' AND u.department LIKE CONCAT('%', #{keyword}, '%'))
  )

```

**효과**

- ✅ 쿼리 템플릿 고정화 → SQL 캐시 효율 향상
- ✅ 조건에 따라 SQL 구문이 바뀌지 않음

---

### 핵심 개선 2: COUNT 쿼리 최적화 (JOIN → EXISTS)

```xml
  SELECT COUNT(*)
  FROM user u
  LEFT JOIN client c ON u.client_id = c.client_id
  LEFT JOIN company co ON c.company_id = co.company_id
  WHERE ...


  SELECT COUNT(*)
  FROM user u
  WHERE u.client_id IS NOT NULL


    AND (
      u.email LIKE CONCAT('%', #{keyword}, '%')
      OR EXISTS (
        SELECT 1 FROM client c
        WHERE c.client_id = u.client_id
        AND c.phone_number LIKE CONCAT('%', #{keyword}, '%')
      )
      OR EXISTS (
        SELECT 1 FROM client c
        JOIN company co ON c.company_id = co.company_id
        WHERE c.client_id = u.client_id
        AND co.name LIKE CONCAT('%', #{keyword}, '%')
      )
    )


```

**JOIN vs EXISTS 비교**

| 항목              | JOIN 후 COUNT(\*)                              | **EXISTS (채택)**                |
| ----------------- | ---------------------------------------------- | -------------------------------- |
| **동작 방식**     | 모든 조인 결과 계산 → 임시 테이블 생성 → COUNT | 조건 만족 시 첫 행에서 검색 중지 |
| **불필요한 조인** | ✅ 발생                                        | ❌ 제거                          |
| **조기 종료**     | ❌ 불가                                        | ✅ 가능                          |
| **성능**          | 느림                                           | 빠름                             |

---

## 4. 성능 측정 결과

### 최종 비교

| 구분              | JPA Spec | MyBatis (초기) | **MyBatis (최종)** | 개선율 (JPA 대비) |
| ----------------- | -------- | -------------- | ------------------ | ----------------- |
| **평균 응답시간** | 24.45ms  | 24.56ms        | **15.51ms**        | **36.8% ↓**       |
| **최대 응답시간** | 83.67ms  | 473ms          | **54ms**           | **35% ↓**         |
| **처리량 (TPS)**  | 221.77   | 66.70          | **273.34**         | **23% ↑**         |

### MyBatis 초기 대비 개선

| 항목              | Before  | After   | 개선율      |
| ----------------- | ------- | ------- | ----------- |
| **평균 응답시간** | 24.56ms | 15.51ms | **36.8% ↓** |
| **최대 응답시간** | 473ms   | 54ms    | **88.5% ↓** |
| **처리량 (TPS)**  | 66.7    | 273.34  | **309% ↑**  |

---

## 5. 핵심 개선 포인트

### 1️⃣ 쿼리 구조 단순화

- `<choose>` 중첩 제거 → OR 조건 기반 통합
- SQL 템플릿 고정화 → DB 캐시 효율 향상

### 2️⃣ 불필요한 JOIN 제거

- COUNT 쿼리를 EXISTS 서브쿼리로 변경
- 조건 만족 시 첫 행에서 검색 중지

### 3️⃣ DB 부하 감소

- 임시 테이블 생성 없이 COUNT 계산
- 인덱스 활용 최적화

---

## 6. 하이브리드 ORM 전략

| 구분            | 기술    | 사용 사례                      |
| --------------- | ------- | ------------------------------ |
| **기본 CRUD**   | JPA     | 회원 등록/수정/삭제, 단순 조회 |
| **복잡한 검색** | MyBatis | 다중 조건 필터링, 통계 쿼리    |
| **장점**        | -       | 개발 생산성 ↑, 쿼리 성능 ↑     |

---

## 7. 결론

:::success 성과

- JPA Specification 대비 **평균 응답시간 36% 개선** (24.45ms → 15.51ms)
- MyBatis 초기 대비 **최대 응답시간 88.5% 감소** (473ms → 54ms)
- **쿼리 구조 단순화 + EXISTS 패턴**으로 DB 부하 감소
  :::

:::tip 배운 점

- **ORM 한계 상황 인지**: 복잡한 조회는 SQL 중심 접근이 효율적
- **동적 SQL 최적화**: 쿼리 템플릿 고정화의 중요성
- **EXISTS 서브쿼리 패턴**: JOIN 없이 조건 확인 가능
  :::

---

## 8. 추가 고려사항

### 인덱스 설계

```sql
-- user 테이블
CREATE INDEX idx_user_client_id ON user(client_id);
CREATE INDEX idx_user_last_login_at ON user(last_login_at);
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_user_name ON user(name);

-- client 테이블
CREATE INDEX idx_client_company_id ON client(company_id);
CREATE INDEX idx_client_phone_number ON client(phone_number);

-- company 테이블
CREATE INDEX idx_company_name ON company(name);
```

### 실행 계획 분석

```sql
EXPLAIN SELECT COUNT(*)
FROM user u
WHERE u.client_id IS NOT NULL
AND (
  u.email LIKE '%keyword%'
  OR EXISTS (
    SELECT 1 FROM client c
    WHERE c.client_id = u.client_id
    AND c.phone_number LIKE '%keyword%'
  )
);
```

---

## 9. 참고 자료

- [MyBatis - Dynamic SQL](https://mybatis.org/mybatis-3/dynamic-sql.html)
- [MySQL Performance - EXISTS vs JOIN](https://dev.mysql.com/doc/refman/8.0/en/exists-and-in-subquery-optimization.html)
