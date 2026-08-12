---
sidebar_position: 1
title: Toss SDK 초기화와 금액 갱신 책임 분리
---

# Toss Payments SDK 초기화와 금액 갱신 책임 분리

> SDK 인스턴스의 생명주기와 결제 금액 갱신 시점을 분리한 과정을 정리합니다.

---

## 0. 개요

:::danger 문제 상황

- 결제 페이지 상태 변경 시 Toss Payments Widget이 반복 초기화
- 쿠폰/포인트 할인 적용 시 **화면이 깜빡이며 재렌더링**
- 간헐적으로 **"결제 수단을 선택해주세요" 에러** 발생
  :::

:::tip 해결 방향

- **SDK 생명주기 정리**: 금액 상태 변경과 SDK 초기화를 분리
- **금액 업데이트 시점 변경**: 결제 버튼 클릭 → 서버 응답 후 1회만
- **useRef로 인스턴스 관리**: 리렌더링 없이 SDK 객체 유지
  :::

---

## 1. 문제 진단

### AS-IS: 문제가 되었던 코드 구조

```jsx
// pages/PaymentPage.jsx (개선 전)
const PaymentPage = () => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [usedPoint, setUsedPoint] = useState(0);

  const paymentRequest = () => {
    const paymentWidget = paymentWidgetRef.current;
    requestPayment(cartId, couponId, paymentWidget, usedPoint);
  };

  // 문제 1: SDK 관련 값을 useEffect 의존성에 포함
  useEffect(() => {
    (async () => {
      const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
      // SDK 초기화 + 위젯 렌더링
    })();
  }, [totalPrice, salePrice, usedPoint]); // ❌ 금액 변경 시마다 재초기화

  // 문제 2: 금액 업데이트 useEffect가 별도로 존재
  useEffect(() => {
    const paymentMethodsWidget = paymentMethodsWidgetRef.current;
    if (paymentMethodsWidget == null) return;

    paymentMethodsWidget.updateAmount(
      Math.max(totalPrice - salePrice - usedPoint, 0)
    );
  }, [totalPrice, salePrice, usedPoint]); // ❌ 금액 변경 시마다 실행

  return 결제하기;
};
```

```jsx
// hooks/useRequestPayment (개선 전)
const useRequestPayment = () => {
  const requestPayment = async (cartId, couponId, paymentWidget, point) => {
    try {
      const response = await api.post("/api/payments/prepare", {
        cartId,
        couponId,
        point,
      });

      // Toss 결제창 호출
      paymentWidget?.requestPayment(response.data);
    } catch (error) {
      console.error("결제 실패:", error);
    }
  };

  return requestPayment;
};
```

**문제점**

1. **금액 관련 state가 useEffect 의존성 배열에 포함**
   - 쿠폰 적용 → `salePrice` 변경 → useEffect 실행 → SDK 재초기화 → 화면 깜빡임
2. **초기화와 금액 갱신의 실행 순서가 불명확**
   - SDK 인스턴스가 준비되기 전에 금액 갱신 Effect가 실행될 가능성
3. **결제 버튼 클릭 전에 금액 업데이트**
   - 서버 검증 전에 클라이언트에서 금액 계산 → 불일치 가능성

---

## 2. 해결 과정

### Step 1: useEffect 의존성 배열 최적화

```jsx
// pages/PaymentPage.jsx (개선 후)
const PaymentPage = () => {
  const paymentWidgetRef = useRef(null);
  const paymentMethodsWidgetRef = useRef(null);

  const paymentRequest = () => {
    const paymentWidget = paymentWidgetRef.current;
    const paymentMethodsWidget = paymentMethodsWidgetRef.current;

    requestPayment(
      cartId,
      couponId,
      paymentWidget,
      paymentMethodsWidget,
      usedPoint
    );
  };

  // SDK 초기화를 금액 상태 변경과 분리
  useEffect(() => {
    (async () => {
      try {
        const paymentWidget = await loadPaymentWidget(clientKey, customerKey);
        paymentWidgetRef.current = paymentWidget;

        const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
          "#payment-widget",
          { value: totalPrice }
        );
        paymentMethodsWidgetRef.current = paymentMethodsWidget;
      } catch (error) {
        console.error("SDK 초기화 실패:", error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 개발 환경의 Strict Mode에서는 검증 목적으로 재실행될 수 있음

  return 결제하기;
};
```

**핵심 개선**

- ✅ SDK 초기화를 금액 관련 상태 변경과 분리
- ✅ SDK 인스턴스를 `useRef`에 저장 → **리렌더링 없이 값 유지**
- ✅ 금액 업데이트 useEffect 제거 → **결제 버튼 클릭 시점으로 이동**

---

### Step 2: 금액 업데이트 시점 변경

```jsx
// hooks/useRequestPayment (개선 후)
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

- ✅ **서버 응답 후 금액 업데이트** → 서버가 계산한 금액을 결제 위젯에 반영
- ✅ **결제 버튼 클릭 시 updateAmount 호출** → 초기화와 금액 갱신의 실행 순서 명확화
- ✅ `paymentMethodsWidget`을 함께 전달 → SDK 호출 안정화

---

## 3. 개선 효과

### 성능 비교

| 항목                      | Before      | After   | 개선율        |
| ------------------------- | ----------- | ------- | ------------- |
| 항목                       | Before                         | After                         |
| -------------------------- | ------------------------------ | ----------------------------- |
| **SDK 초기화**             | 금액 관련 상태 변경마다 재실행 | 컴포넌트 생명주기에 맞춰 실행 |
| **금액 갱신**              | 별도 Effect에서 실행           | 결제 요청 시 서버 응답 후 실행 |
| **화면 깜빡임**            | 반복 초기화 과정에서 발생      | 반복 초기화 제거 후 완화       |
| **"결제 수단 선택" 에러** | 간헐적 발생                    | 실행 순서 정리 후 재현되지 않음 |

### 시나리오별 실행 경로

| 작업 흐름   | Before                          | After          |
| ----------- | ------------------------------- | -------------- |
| 페이지 진입 | 2회 (초기화 + 금액 업데이트)    | 1회 (초기화만) |
| 쿠폰 적용   | +2회 (재초기화 + 금액 업데이트) | 0회            |
| 포인트 적용 | +2회                            | 0회            |
| 쿠폰 변경   | +2회                            | 0회            |
| **정리**    | 상태 변경마다 관련 Effect 실행 | 초기화와 금액 갱신 경로 분리 |

---

## 4. 핵심 포인트

### 1️⃣ useEffect 의존성 관리

```jsx
// ❌ 잘못된 예시
useEffect(() => {
  // SDK 초기화
}, [totalPrice, salePrice, usedPoint]);

// ✅ 올바른 예시
useEffect(() => {
  // SDK 초기화를 금액 상태 변경과 분리
}, []);
```

**원칙**

- **외부 라이브러리 초기화**: 금액 상태 변경과 독립된 Effect에서 수행
- **상태 업데이트**: 이벤트 핸들러 또는 API 응답 후 처리
- **의존성 배열**: 정말 필요한 값만 포함

---

### 2️⃣ useRef의 올바른 활용

```jsx
// ❌ 잘못된 예시 (state 사용)
const [paymentWidget, setPaymentWidget] = useState(null);
// → 리렌더링 발생

// ✅ 올바른 예시 (useRef 사용)
const paymentWidgetRef = useRef(null);
paymentWidgetRef.current = paymentWidget;
// → 리렌더링 없이 값 유지
```

**useRef 사용 시기**

- ✅ 리렌더링을 유발하지 않아야 하는 값
- ✅ 외부 라이브러리 인스턴스
- ✅ DOM 엘리먼트 참조

---

### 3️⃣ 비동기 작업 순서 관리

```
[결제 버튼 클릭]
      ↓
[1. 서버에 결제 정보 전송]
      ↓
[2. 서버가 최종 금액 계산 및 검증]
      ↓
[3. updateAmount(서버 금액)]
      ↓
[4. requestPayment(결제창 호출)]
```

**원칙**

- ✅ **서버가 최종 금액을 계산**하고 클라이언트는 그 값을 위젯에 반영
- ✅ **비동기 작업 순서를 명시**해 초기화 전 갱신 가능성을 줄임
- ✅ **단일 진입점**(결제 버튼)에서 모든 작업 제어

---

## 5. 추가 개선사항

### 에러 처리 강화

```jsx
const useRequestPayment = () => {
  const requestPayment = async (...) => {
    try {
      const response = await api.post('/api/payments/prepare', {
        cartId,
        couponId,
        point
      });

      // 금액 음수 체크
      if (response.data.amount < 0) {
        throw new Error('결제 금액이 0원 미만입니다.');
      }

      paymentMethodsWidget.updateAmount(response.data.amount);
      paymentWidget?.requestPayment(response.data);

    } catch (error) {
      // 사용자 친화적인 에러 메시지
      if (error.response?.status === 400) {
        alert('쿠폰 또는 포인트 사용이 유효하지 않습니다.');
      } else {
        alert('결제 처리 중 오류가 발생했습니다.');
      }

      console.error('결제 실패:', error);
    }
  };

  return requestPayment;
};
```

---

## 6. 결론

:::success 성과

- Toss SDK 초기화와 결제 로직을 **마운트 1회 + 결제 버튼 클릭 시 금액 업데이트** 구조로 변경
- **useEffect 의존성 최적화 + useRef의 올바른 활용**으로 불필요한 리렌더링 제거
- 결과적으로 반복 초기화로 인한 로딩 지연과 화면 깜빡임을 줄이고 실행 순서를 명확히 함
  :::

:::tip 배운 점

- **useEffect 의존성 관리의 중요성**
  - 외부 라이브러리는 React의 렌더링 사이클과 분리해서 관리
- **비동기 작업 순서 관리 경험**
  - 공유하는 SDK 인스턴스의 준비 여부에 따라 실행 결과가 달라질 수 있음을 확인
  - 결제 버튼 클릭을 금액 갱신의 단일 진입점으로 구성
- **useRef의 활용**
  - 리렌더링을 유발하지 않으면서 값을 유지해야 할 때 useRef 사용
    :::

---

## 7. 참고 자료

- [Toss Payments - React 연동 가이드](https://docs.tosspayments.com/reference/widget-sdk)
- [React - useEffect](https://react.dev/reference/react/useEffect)
- [React - useRef](https://react.dev/reference/react/useRef)
