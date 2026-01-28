---
slug: jpa-mybatis-hybrid-strategy
title: "복잡한 검색 쿼리, JPA vs MyBatis 성능 비교와 하이브리드 전략"
date: 2025-04-28
categories: [Spring Boot, JPA, MyBatis, Performance]
tags: []
---

# 복잡한 검색 쿼리, JPA vs MyBatis 성능 비교와 하이브리드 전략

> "관리자 페이지의 복잡한 검색 기능 어떻게 구현할까?

이 글에서는 다양한 필터 조건을 가진 검색 기능을 구현하며 **순수 JPA → Native Query → JPA Specification → MyBatis**로 변환한 과정과 각 방식의 성능을 실측한 결과를 공유합니다.

<!-- truncate -->

---

## 1. 프로젝트 요구사항

### 관리자 페이지의 고객 검색 기능

**비즈니스 요구사항:**

- 다양한 필터 조건 지원
  - 기간 필터 (가입일, 최종 로그인)
  - 계정 상태 (활성/비활성/잠김)
  - 권한별 필터
- 키워드 검색 범위
  - 전체 검색 (이메일, 이름, 소속, 부서, 연락처)
  - 개별 필드 검색
- 번호 기반 페이지네이션 (1, 2, 3... 페이지)

### 기술적 요구사항

**성능 목표:**

- 따로 제한은 없었으나 느린 것을 피하고자 함

**유지보수성:**

- 새로운 검색 조건 추가 용이
- 쿼리 가독성 확보
- 테스트 가능한 구조

---

## 2. 구현 과정

### 1단계: 순수 JPA Repository

```java
public interface UserRepository extends JpaRepository {
    Page findByClientCompanyNameContaining(String companyName, Pageable pageable);
    Page findByLastLoginAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
}
```

#### 문제점

- 필터링 조건 마다
  - **Repository 메서드 증가** (조건 N개 → 2^N개)
  - **Service의 분기 처리 복잡**
  - **가독성과 유지 보수성의 저하**

---

### 2단계: Native Query

> @Query 어노테이션 사용

#### 문제점

- Native Query를 사용하여,
  - DB 종속 (MySQL 전용)
  - 동적 조건 처리 (IS NULL OR) 비효율
  - 실행 계획 최적화 어려움
    - **실행 계획 분석:**

    ```sql
        EXPLAIN SELECT u.*
        FROM user u
        WHERE :keyword IS NULL OR u.email LIKE CONCAT('%', :keyword, '%');
    ```

    - **문제점:**
      - MySQL 옵티마이저는 IS NULL OR 조건을 최적화하지 못함
        - 인덱스를 사용하지 못하고 Full Table Scan 발생
        - 데이터가 늘어날수록 성능 저하

---

### 3단계: JPA Specification

**Repository 확장:**

```java
// Specification 사용을 위해 상속만 추가
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {}
```

**Specification 구현:**

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
    }
}
```

#### 장점

- **Fetch Join을 동적으로 제어하여 N+1 문제를 해결**
- **ORM 일관성 유지**

#### 단점

- Java와 SQL 로직 혼재
- **복잡한 쿼리 작성의 어려움**
- **쿼리 튜닝의 어려움**
  - 실제 실행되는 SQL을 보려면 로그 확인 필요
  - 실행 계획 분석이 어려움
  - 인덱스 힌트 사용 불가

#### 성능 테스트 결과

**테스트 환경:**

- JMeter (10명 동시 접속, 50회 요청| `GET /admin/clients`)
- 데이터: User 1,050명 (Admin 50 + Client 1,000)

  | 시나리오                   | 평균 응답시간(ms) | 최대(ms)  | 처리량(TPS) |
  | -------------------------- | ----------------- | --------- | ----------- |
  | Search (키워드 검색)       | 20.99             | 77.33     | 55.93       |
  | Date Filter (날짜 필터)    | 15.86             | 44.00     | 55.96       |
  | Basic (기본 페이지네이션)  | 39.99             | 81.67     | 55.64       |
  | Complex Filter (복합 조건) | 20.95             | 75.00     | 55.30       |
  | **평균**                   | **24.45**         | **83.67** | **221.77**  |

---

## 3. MyBatis 도입

### 도입 배경

**왜 MyBatis인가?**

1. SQL과 Java 코드 완전 분리 → 가독성 향상
2. 복잡한 동적 쿼리 작성 용이
3. 쿼리 튜닝 및 실행 계획 분석 편리
4. 필요한 컬럼만 선택적으로 조회 가능

#### 초기 MyBatis 구현(문제점 포함)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.example.mapper.UserMapper">
    <select id="searchClients" resultType="ClientDto">
        SELECT
            u.user_id,
            u.email,
            u.name,
            u.last_login_at,
            c.phone_number,
            co.company_name
        FROM user u
        LEFT JOIN clients c ON u.client_id = c.client_id
        LEFT JOIN company co ON c.company_id = co.company_id
        WHERE u.enabled = true

        <!-- 날짜 필터 -->
        <if test="startDate != null and endDate != null">
            AND u.last_login_at BETWEEN #{startDate} AND #{endDate}
        </if>

        <!-- 키워드 검색 - 문제점: choose 중첩 -->
        <if test="keyword != null and keyword != ''">
            <choose>
                <when test="range == 'all'">
                    AND (
                        u.email LIKE CONCAT('%', #{keyword}, '%')
                        OR u.name LIKE CONCAT('%', #{keyword}, '%')
                        OR co.company_name LIKE CONCAT('%', #{keyword}, '%')
                        OR c.phone_number LIKE CONCAT('%', #{keyword}, '%')
                    )
                </when>
                <when test="range == 'email'">
                    AND u.email LIKE CONCAT('%', #{keyword}, '%')
                </when>
                <when test="range == 'name'">
                    AND u.name LIKE CONCAT('%', #{keyword}, '%')
                </when>
                <when test="range == 'company'">
                    AND co.company_name LIKE CONCAT('%', #{keyword}, '%')
                </when>
                <when test="range == 'phone'">
                    AND c.phone_number LIKE CONCAT('%', #{keyword}, '%')
                </when>
            </choose>
        </if>

        ORDER BY u.created_at DESC
        LIMIT #{offset}, #{size}
    </select>

    <!-- COUNT 쿼리 - 문제점: 불필요한 JOIN -->
    <select id="countFilteredClients" resultType="long">
        SELECT COUNT(*)
        FROM user u
        LEFT JOIN clients c ON u.client_id = c.client_id
        LEFT JOIN company co ON c.company_id = co.company_id
        WHERE u.enabled = true

        <if test="startDate != null and endDate != null">
            AND u.last_login_at BETWEEN #{startDate} AND #{endDate}
        </if>

        <if test="keyword != null and keyword != ''">
            <choose>
                <when test="range == 'all'">
                    AND (
                        u.email LIKE CONCAT('%', #{keyword}, '%')
                        OR u.name LIKE CONCAT('%', #{keyword}, '%')
                        OR co.company_name LIKE CONCAT('%', #{keyword}, '%')
                        OR c.phone_number LIKE CONCAT('%', #{keyword}, '%')
                    )
                </when>
                <!-- ... 동일한 choose 반복 -->
            </choose>
        </if>
    </select>
</mapper>
```

#### 초기 MyBatis 성능 테스트

| 시나리오       | 평균 응답시간(ms) | 최대(ms) | 처리량(TPS) |
| -------------- | ----------------- | -------- | ----------- |
| Search         | 24.04             | 108      | 59.15       |
| Date Filter    | 23.39             | 92       | 59.34       |
| Basic          | 23.85             | **473**  | 57.59       |
| Complex Filter | 23.46             | 112      | 59.32       |
| **평균**       | **24.56**         | **473**  | **66.70**   |

### 문제 분석

- **choose 중첩으로 인한 SQL 캐시 비효율**
- 최대 응답시간 편차 큼 (473ms)
- **COUNT 쿼리의 불필요한 JOIN**

  ```sql
  SELECT COUNT(*) # 4) 3단계 조인 후 연산
  FROM user u # 1) user 테이블 스캔
  LEFT JOIN clients c ON u.client_id = c.client_id # 2) 임시 테이블 생성
  LEFT JOIN company co ON c.company_id = co.company_id # 3) 임시 테이블 생성)
  WHERE ...
  ```

---

## 4. MyBatis 최적화

### 개선 1: 동적 SQL 단순화

**Before (choose 중첩) → After (OR 조건 통합):**

```xml
<if test="keyword != null and keyword != ''">
    AND (
        (#{range} = 'all' AND (
            u.email LIKE CONCAT('%', #{keyword}, '%')
            OR u.name LIKE CONCAT('%', #{keyword}, '%')
            OR co.company_name LIKE CONCAT('%', #{keyword}, '%')
            OR c.phone_number LIKE CONCAT('%', #{keyword}, '%')
        ))
        OR (#{range} = 'email' AND u.email LIKE CONCAT('%', #{keyword}, '%'))
        OR (#{range} = 'name' AND u.name LIKE CONCAT('%', #{keyword}, '%'))
        OR (#{range} = 'company' AND co.company_name LIKE CONCAT('%', #{keyword}, '%'))
        OR (#{range} = 'phone' AND c.phone_number LIKE CONCAT('%', #{keyword}, '%'))
    )
</if>
```

**효과:**

- **Before:** range 값에 따라 5개의 다른 SQL 생성
- **After:** 항상 동일한 SQL 템플릿 생성 > 실행 계획 재사용성 증가

### 개선 2: COUNT 쿼리 최적화

**Before (JOIN 기반) → After (EXISTS 서브쿼리 기반)**

```xml
<select id="countFilteredClients" resultType="long">
    SELECT COUNT(*)
    FROM user u
    WHERE u.enabled = true

    <if test="startDate != null and endDate != null">
        AND u.last_login_at BETWEEN #{startDate} AND #{endDate}
    </if>

    <if test="keyword != null and keyword != ''">
        AND (
            (#{range} = 'all' AND (
                u.email LIKE CONCAT('%', #{keyword}, '%')
                OR u.name LIKE CONCAT('%', #{keyword}, '%')
                OR EXISTS (
                    SELECT 1 FROM clients c
                    JOIN company co ON c.company_id = co.company_id
                    WHERE c.client_id = u.client_id
                    AND co.company_name LIKE CONCAT('%', #{keyword}, '%')
                )
                OR EXISTS (
                    SELECT 1 FROM clients c
                    WHERE c.client_id = u.client_id
                    AND c.phone_number LIKE CONCAT('%', #{keyword}, '%')
                )
            ))
            OR (#{range} = 'email' AND u.email LIKE CONCAT('%', #{keyword}, '%'))
            OR (#{range} = 'name' AND u.name LIKE CONCAT('%', #{keyword}, '%'))
            OR (#{range} = 'company' AND EXISTS (
                SELECT 1 FROM clients c
                JOIN company co ON c.company_id = co.company_id
                WHERE c.client_id = u.client_id
                AND co.company_name LIKE CONCAT('%', #{keyword}, '%')
            ))
            OR (#{range} = 'phone' AND EXISTS (
                SELECT 1 FROM clients c
                WHERE c.client_id = u.client_id
                AND c.phone_number LIKE CONCAT('%', #{keyword}, '%')
            ))
        )
    </if>
</select>
```

### EXISTS vs JOIN 성능 비교

1. **JOIN 방식:**

   ```sql
   SELECT COUNT(*)
   FROM user u
   LEFT JOIN clients c ON u.client_id = c.client_id
   LEFT JOIN company co ON c.company_id = co.company_id
   WHERE co.company_name LIKE '%ABC%'
   ```

   **실행 과정:**

   ```
    1. user 테이블 전체 스캔
    2. clients 테이블과 조인 (1,000건)
    3. company 테이블과 조인 (1,000건)
    4. WHERE 조건 필터링
    5. COUNT(*) 계산
   ```

2. **EXISTS 방식:**

   ```sql
   SELECT COUNT(*)
   FROM user u
   WHERE EXISTS (
   SELECT 1 FROM clients c
   JOIN company co ON c.company_id = co.company_id
   WHERE c.client_id = u.client_id
   AND co.company_name LIKE '%ABC%'
   )
   ```

   **실행 과정:**

   ```
   1. user 테이블 전체 스캔
   2. 각 행마다 EXISTS 서브쿼리 실행
       2.1. 조건 만족 시 즉시 TRUE 반환 (조기 종료)
       2.2. 첫 번째 매칭 행 발견 시 더 이상 검색 안 함
   3. COUNT(*) 계산

   → 필요한 만큼만 조인
   ```

**성능 차이:**

- JOIN 방식: 1,000건 조인 → 1,000건 처리
- EXISTS 방식: 조기 종료 → 평균 150건 처리

---

## 5. 최종 성능 비교

### MyBatis 최적화 후 테스트 결과

| 시나리오       | 평균 응답시간(ms) | 최대(ms) | 처리량(TPS) |
| -------------- | ----------------- | -------- | ----------- |
| Search         | 17.16             | 48       | 68.95       |
| Date Filter    | 15.89             | 32       | 68.99       |
| Basic          | 17.23             | 54       | 68.64       |
| Complex Filter | 17.11             | 48       | 69.02       |
| **평균**       | **15.51**         | **54**   | **273.34**  |

### 전체 비교

![image](../../docs/projects/security-ticket/img/mybatis_성능.png)

### 개선 효과

**MyBatis 개선 전 대비:**

- 평균 응답시간 **36.8% 감소** (24.56 → 15.51ms)
- 최대 응답시간 **88.5% 감소** (473 → 54ms)
- 처리량 **3.9배 증가** (66.7 → 273 TPS)

**JPA Specification 대비:**

- 평균 응답시간 **36.5% 감소** (24.45 → 15.51ms)
- 최대 응답시간 **35.5% 감소** (83.67 → 54ms)
- Basic 요청 **2.3배 빠름** (39.99 → 17.23ms)
- 처리량 **23% 향상** (221.77 → 273 TPS)

### 최종 아키텍처 설계(혼합)

**JPA를 사용할 때:**

- 단순 CRUD 작업
- 엔티티 간 관계 활용이 중요한 경우
- 트랜잭션 내에서 엔티티 변경 추적이 필요한 경우
- 2~3개 이하의 조건 조합

**MyBatis를 사용할 때:**

- Window Function 및 복잡한 서브쿼리
- 다중 테이블 조인 (3개 이상)
- 성능 최적화가 중요한 대용량 조회
- 쿼리 튜닝이 필요한 경우

## 6. 정리

### 핵심 요약

**최종 전략:**

- **JPA**: 단순 CRUD, 엔티티 관계 활용
- **MyBatis**: 복잡한 검색, 통계, 성능 최적화

**성능 개선:**

- 평균 응답시간 **36.5% 감소**
- 최대 응답시간 **88.5% 감소**
- 처리량 **23% 향상**

**참고 자료**

- [MyBatis Documentation](https://mybatis.org/mybatis-3/)
- [MySQL Performance Tuning - EXISTS vs JOIN](https://dev.mysql.com/doc/refman/8.0/en/subquery-optimization.html)
