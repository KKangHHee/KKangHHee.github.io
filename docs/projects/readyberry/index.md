---
sidebar_position: 3
title: ReadyBerry
description: 간편 선결제 테이크아웃 서비스
---

# 🍓 ReadyBerry

> **간편 선결제 테이크아웃 서비스** - 오프라인 매장의 주문/결제 프로세스를 디지털화하여 대기 시간 감소

---

## 📋 프로젝트 개요

| 항목        | 내용                                                   |
| ----------- | ------------------------------------------------------ |
| **기간**    | 2023.12 ~ 2024.05 (5개월)                              |
| **팀 구성** | BE 2명, FE 4명, PM 1명, Designer 1명, Marketer 2명     |
| **역할**    | Frontend Developer (결제 시스템 / 매장 관리 화면 담당) |
| **배포**    | AWS EC2 + NginX                                        |

### 핵심 문제 인식

오프라인 매장에서 발생하는 **비효율적인 주문 프로세스**:

- ❌ 주문 시 긴 대기 시간
- ❌ 주문 누락 및 오류
- ❌ 결제 지연으로 인한 혼잡

### 해결 방향

- ✅ 미리 주문/결제 → 매장에서 바로 픽업
- ✅ 테이블 오더 기능으로 매장 내 주문 간소화
- ✅ Toss Payments SDK 기반 안정적인 결제 시스템

---

## 🎯 주요 기능

### 고객 서비스

- 🔐 **소셜 로그인**: Google / Kakao OAuth2 연동
- 🛒 **선결제 테이크아웃**: 메뉴 선택 → 결제 → 픽업
- 🍽️ **테이블 오더**: QR 코드 스캔 → 주문 → 테이블로 배달
- 💳 **결제**: Toss Payments SDK 연동 (카드/간편결제)
- 🎟️ **쿠폰/포인트**: 할인 및 적립 시스템

### 사장님 대시보드

- 📊 **매장 관리**: 정보 수정, 영업 시간 설정
- 🍔 **메뉴 관리**: 메뉴 등록/수정/삭제, 카테고리 관리
- 📦 **주문 확인**: 실시간 주문 알림, 상태 관리
- 💰 **매출 통계**: 일별/월별 매출 현황

---

## 🏗️ 시스템 아키텍처

### 프론트엔드 구조

```
┌─────────────────────────────────────────┐
│         React + Vite (고객/사장님)       │
│  ┌──────────────┬──────────────────┐   │
│  │   Recoil     │  React Query     │   │
│  │  (전역 상태)  │  (서버 상태)      │   │
│  └──────────────┴──────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   Toss Payments SDK              │  │
│  │   - 결제 위젯 초기화              │  │
│  │   - 쿠폰/포인트 할인 적용          │  │
│  └──────────────────────────────────┘  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Spring Boot 3.x (Backend API)         │
│  ┌──────────────┬──────────────────┐   │
│  │   JPA        │    MySQL         │   │
│  │  (주문/결제)  │  (메인 DB)        │   │
│  └──────────────┴──────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🔧 기술 스택

### Frontend

| 기술                  | 선택 이유                                        |
| --------------------- | ------------------------------------------------ |
| **React + Vite**      | 빠른 빌드 속도, HMR 지원으로 개발 생산성 향상    |
| **Recoil**            | 간결한 API, 비동기 처리 용이, 작은 번들 사이즈   |
| **React Query**       | 서버 상태 캐싱, 자동 재검증, 로딩/에러 상태 관리 |
| **React Hook Form**   | 성능 최적화된 폼 처리, 유효성 검사 간소화        |
| **Toss Payments SDK** | 국내 환경 최적화 PG 연동                         |
| **Axios**             | Interceptor로 토큰/에러 중앙 관리                |

### Backend

- **Java 17 + Spring Boot 3.x**: 안정적인 서버 개발
- **JPA + MySQL**: 데이터 영속성 관리
- **Redis**: 세션 관리

---

## 🎯 담당 역할

### 1. Toss Payments SDK 통합 및 결제 시스템 구축

**문제**: Toss Payments Widget 초기화 시 3~5초 소요, 쿠폰/포인트 적용 시 화면 깜빡임

**해결**: useEffect 최적화 + useRef 활용

```jsx
// pages/PaymentPage.jsx
const PaymentPage = () => {
  const paymentWidgetRef = useRef(null);
  const paymentMethodsWidgetRef = useRef(null);

  const paymentRequest = () => {
    const paymentWidget = paymentWidgetRef.current;
    const paymentMethodsWidget = paymentMethodsWidgetRef.current;

    requestPayment(cartId, couponId, paymentWidget, paymentMethodsWidget, usedPoint);
  };

  // SDK 초기화 (마운트 시 1회만)
  useEffect(() => {
    (async () => {
      const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
      paymentWidgetRef.current = paymentWidget;

      const paymentMethodsWidget = paymentWidget.renderPaymentMethods(...);
      paymentMethodsWidgetRef.current = paymentMethodsWidget;
    })();
  }, []); // 의존성 배열 비움 → 1회만 실행

  return (


      결제하기

  );
};
```

```jsx
// hooks/useRequestPayment
const useRequestPayment = () => {
  const requestPayment = async (
    cartId,
    couponId,
    paymentWidget,
    paymentMethodsWidget,
    point
  ) => {
    try {
      // 1. 서버에 결제 정보 전송
      const response = await api.post("/api/payments/prepare", {
        cartId,
        couponId,
        point,
      });

      // 2. 서버가 계산한 최종 금액으로 위젯 업데이트
      paymentMethodsWidget.updateAmount(Math.max(response.data.amount, 0));

      // 3. Toss 결제창 호출
      paymentWidget?.requestPayment(response.data);
    } catch (error) {
      console.error("결제 실패:", error);
    }
  };

  return requestPayment;
};
```

**핵심 개선**

- ✅ **SDK 초기화는 마운트 시 1회만 실행** (`useEffect([])`)
- ✅ **결제 버튼 클릭 시 서버 금액 기반으로 updateAmount 호출**
- ✅ **useRef로 SDK 인스턴스 값을 관리** → 불필요한 리렌더링 제거

[상세 분석 보기 →](./troubleshooting/toss-sdk-optimization)

---

### 2. 홈/마이페이지, 매장 관리 화면 전체 개발

- **마이페이지**: 쿠폰/포인트/주문 내역 조회
- **매장 관리**: 정보 관리, 메뉴 관리, 주문 확인 UI

### 3. Recoil 기반 전역 상태관리 및 React Query 데이터 페칭 최적화

```jsx
// Atom 정의
export const cartState = atom({
  key: "cartState",
  default: [],
});

export const selectedCouponState = atom({
  key: "selectedCouponState",
  default: null,
});

// 서버 상태 관리 (React Query)
const useMenu = (storeId) => {
  return useQuery({
    queryKey: ["menu", storeId],
    queryFn: () => api.get(`/api/stores/${storeId}/menu`),
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
};
```

---

## 🔥 핵심 기술 도전

### 결제 페이지 로딩 시간 70% 단축

**문제**: Toss SDK 초기화에 3~5초 소요, useEffect 중복 실행

**해결**: useEffect 의존성 최적화 + useRef 활용

| 항목                    | Before  | After   | 개선율        |
| ----------------------- | ------- | ------- | ------------- |
| **결제 페이지 로딩**    | 3~5초   | 1초     | **약 70% ↓**  |
| **useEffect 실행 횟수** | 8~12회  | 1회     | **약 90% ↓**  |
| **화면 깜빡임**         | ✅ 발생 | ❌ 제거 | **100% 개선** |

[상세 분석 보기 →](./troubleshooting/toss-sdk-optimization)

---

## 📊 주요 성과

### 실사용 배포 및 운영

- ✅ **교내 축제에서 테이블 오더 서비스 운영**
- ✅ **학교 인근 카페 2곳 실사용 배포 및 실제 운영**
- ✅ 사용자 피드백 기반 UI 개선 → **주문 완료 이탈율 감소**

### 기술적 성과

- ✅ Toss SDK 최적화로 **결제 페이지 로딩 시간 70% 단축**
- ✅ useEffect 중복 실행 문제 해결 → **화면 깜빡임 제거**
- ✅ Recoil + React Query로 **전역/서버 상태 명확히 분리**

---

## 💡 배운 점

### 비즈니스적 배움

- 기획–디자인–백엔드–마케팅과의 협업 과정을 통해, **서비스 전반을 바라보는 시야 확보**
- 실제 점주 및 사용자 피드백을 반영하며, **비즈니스 관점에서 기능을 우선순위화하는 경험**

### 기술적 배움

- **useEffect 의존성 관리 중요성**
  - 외부 라이브러리는 React의 렌더링 사이클과 분리해서 관리
- **비동기 작업과 Race Condition 처리 경험**
  - 두 개의 useEffect가 동시에 실행되면 **경합 조건** 발생 가능
  - **단일 진입점**(결제 버튼 클릭)에서 모든 작업을 순차적으로 처리
- **백엔드 개발 전환 계기**
  - API 설계 과정에서 데이터 정합성, 트랜잭션 처리의 중요성 인식
  - 프론트엔드는 "표현 계층"이지만, 실제 비즈니스 로직은 백엔드에서 처리됨을 체감
  - 결제/주문 도메인의 복잡성을 이해하며 백엔드 개발에 대한 관심 증대

---

## 🔗 관련 링크

- [GitHub Repository](https://github.com/readyvery)
- [Customer URL](https://ready.marinesnow34.com/)
- [Store URL](https://ceo-ready.marinesnow34.com/)
- [시연 영상](https://www.youtube.com/watch?v=Z2nVQB3tUyw)
