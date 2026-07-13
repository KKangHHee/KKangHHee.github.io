---
slug: oracle11g-hibernate-pagination
title: "Oracle 11g에서 Hibernate 6 페이징이 깨질 때: ROWNUM 2단계 조회"
date: 2026-06-08
categories: [Spring Boot, JPA, QueryDSL, Oracle]
tags: []
---

# Oracle 11g에서 Hibernate 6 페이징이 깨질 때

> 개발 환경에서는 정상 동작하던 페이징이 Oracle 11g에서 SQL 문법 오류를 일으켰습니다.

레거시 마이그레이션 과정에서 **Hibernate 6이 생성한 SQL과 Oracle 11g의 문법이 호환되지 않는 문제**를 만났습니다. 원인을 확인하고 ROWNUM과 QueryDSL을 조합해 해결한 과정을 정리합니다.

<!-- truncate -->

---

## 1. 문제

Spring Boot(Hibernate 6.x)와 QueryDSL로 페이징 쿼리를 작성하면 Hibernate는 다음 SQL을 생성합니다.

```sql
SELECT ...
FROM send_history
ORDER BY sent_at DESC
OFFSET ? ROWS FETCH FIRST ? ROWS ONLY
```

`OFFSET ... FETCH`는 SQL 표준 페이징 문법이지만 Oracle에서는 **12c부터** 지원합니다. 운영 DB는 **Oracle 11g**였기 때문에 이 구문을 해석하지 못하고 문법 오류를 반환했습니다.

> 애플리케이션 로직이 아니라 프레임워크가 생성한 SQL과 운영 DB 버전 사이의 호환성 문제였습니다.

---

## 2. 배경: 11g의 페이징은 ROWNUM

`OFFSET ... FETCH`가 없던 시절, Oracle은 `ROWNUM`이라는 의사 컬럼(pseudo column)으로 페이징을 했습니다. 그런데 `ROWNUM`은 한 가지 함정이 있습니다.

```sql
-- 이렇게 쓰면 의도대로 동작하지 않음
SELECT * FROM send_history
WHERE ROWNUM BETWEEN 11 AND 20   -- ❌ 11~20행이 안 나옴
ORDER BY sent_at DESC
```

`ROWNUM`은 **정렬(ORDER BY)이 적용되기 전에** 행 번호가 매겨지고, `ROWNUM > 1` 같은 조건은 영영 참이 되지 않는 특성이 있습니다. 그래서 **서브쿼리로 한 번 감싸서** 정렬을 먼저 끝낸 뒤 번호를 매겨야 합니다.

```sql
SELECT * FROM (
    SELECT inner_q.*, ROWNUM rn
    FROM (
        SELECT id
        FROM send_history
        WHERE /* 검색 조건 */
        ORDER BY sent_at DESC          -- 1) 정렬 먼저
    ) inner_q
    WHERE ROWNUM <= :end               -- 2) 끝 번호까지 자르고
)
WHERE rn > :start;                     -- 3) 시작 번호 이후만
```

---

## 3. 해결: ID만 페이징하고, 본문은 QueryDSL로

저는 페이징을 **2단계**로 나눴습니다.

1. **1단계 (native ROWNUM):** 위 서브쿼리로 **해당 페이지의 ID만** 가져온다.
2. **2단계 (QueryDSL):** 그 ID들을 `IN` 절에 넣어 **실제 데이터를 조회**한다.

```java
// 1단계: native 쿼리로 페이지에 해당하는 ID만 조회
List<Long> ids = sendHistoryRepository.findPagedIds(condition, start, end);

// 2단계: QueryDSL 로 본문 조회 (IN 절)
List<SendHistory> rows = queryFactory
        .selectFrom(sendHistory)
        .where(sendHistory.id.in(ids))
        .fetch();
```

두 단계로 분리하면 다음 장점을 얻을 수 있습니다.

- ROWNUM 기반 페이징은 **native 쿼리**로 명확하게 제어합니다.
- 동적 검색 조건과 본문 매핑은 **QueryDSL의 타입 안전성**을 활용합니다.

### 주의 1) IN 절은 순서를 보장하지 않는다

`IN (3, 1, 2)`로 조회해도 DB가 `1, 2, 3` 순서로 줄 수 있습니다. 1단계에서 정렬해 둔 순서가 2단계에서 깨질 수 있다는 뜻이죠. 그래서 **메모리에서 ID 순서대로 다시 정렬**해 줍니다.

```java
Map<Long, SendHistory> map = rows.stream()
        .collect(Collectors.toMap(SendHistory::getId, Function.identity()));

// 1단계에서 받은 ids 순서대로 재정렬
List<SendHistory> ordered = ids.stream()
        .map(map::get)
        .toList();
```

### 주의 2) 전체 개수(count)는 별도 쿼리

페이지 번호를 그리려면 전체 건수가 필요합니다. 이건 `ORDER BY` 없이 단순 `COUNT(*)`로 따로 조회하면 됩니다.

---

## 4. 정리

| 항목     | 내용                                                        |
| -------- | ----------------------------------------------------------- |
| **문제** | Hibernate 6이 만든 `OFFSET ... FETCH`를 Oracle 11g가 미지원 |
| **원인** | 해당 표준 페이징 문법은 Oracle 12c부터 지원                 |
| **해결** | native ROWNUM으로 ID만 페이징 → QueryDSL IN 절로 본문 조회  |
| **주의** | IN 절 순서 미보장 → 메모리 재정렬 / count는 별도 쿼리       |

최신 프레임워크가 생성하는 SQL이 모든 레거시 DB에서 동작하는 것은 아닙니다. 운영 DB의 버전과 방언을 확인하고, 호환되지 않는 부분만 native 쿼리로 제한하는 것이 이번 해결의 핵심이었습니다.
