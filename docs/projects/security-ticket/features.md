---
sidebar_position: 3
title: 주요 기능
description: 관리자 백오피스의 핵심 기능과 기술적 구현 포인트
---

# III. 주요 기능

## 1️⃣ 보안 티켓 관리

### 📌 기능 설명
- 보안 이슈를 **티켓 단위로 등록 / 수정 / 조회**
- 상태값 기반 워크플로우 관리
  - 예: `OPEN → IN_PROGRESS → DONE`
- 담당자 및 우선순위 설정

### 🔧 구현 포인트
- JPA 기반 기본 CRUD 처리
- Enum을 활용한 상태 관리로 도메인 안정성 확보
- 변경 이력 추적을 위한 공통 엔티티 설계

---

## 2️⃣ 복잡한 검색 및 필터링

### 📌 기능 설명
- 다중 조건 검색 지원
  - 상태
  - 담당자
  - 기간
  - 키워드
- 관리자 페이지 특성상 **대량 데이터 조회** 빈번

### 🔧 구현 포인트
- **MyBatis 도입**
  - 동적 SQL (`<if>`, `<choose>`) 활용
  - 조건 조합에 따른 쿼리 분기 처리
- 인덱스 기반 쿼리 튜닝으로 응답 속도 개선

```sql
<select id="searchTickets" resultType="Ticket">
  SELECT *
  FROM ticket
  WHERE 1=1
  <if test="status != null">
    AND status = #{status}
  </if>
  <if test="keyword != null">
    AND title LIKE CONCAT('%', #{keyword}, '%')
  </if>
</select>
```

## 3️⃣ 페이징 및 정렬 처리
### 📌 기능 설명

- 대량 데이터 환경에서의 페이지 단위 조회
- 생성일, 우선순위 기준 정렬

### 🔧 구현 포인트

- MyBatis 기반 LIMIT / OFFSET 처리

- 요청 파라미터에 따른 정렬 컬럼 동적 적용

- 프론트엔드에서 React Query를 활용한 서버 상태 관리

## 4️⃣ 인증 및 권한 관리
### 📌 기능 설명

- 관리자 전용 접근 제어

- 역할 기반 기능 제한

### 🔧 구현 포인트

- Spring Security 기반 인증/인가

- JWT를 활용한 Stateless 인증 구조

- 권한에 따른 API 접근 제어

## 5️⃣ 관리자 UI/UX 개선
### 📌 기능 설명

- 데이터 중심 관리자 화면

- 빠른 정보 파악을 위한 테이블 UI

### 🔧 구현 포인트

- Tailwind CSS로 일관된 UI 구성

- React 컴포넌트 단위 분리로 재사용성 확보

- 로딩 / 에러 상태 명확히 분리하여 UX 개선

---

## ✅ 기능 구현 핵심 요약

- 단순 CRUD와 복잡한 조회 로직 분리

- 검색 성능 개선을 위해 MyBatis 선택

- 관리자 사용성을 고려한 UI/UX 설계

- 보안과 데이터 무결성을 최우선으로 고려

---
