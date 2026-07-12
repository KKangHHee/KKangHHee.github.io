---
sidebar_position: 1
title: Toss SDK useEffect 최적화 (70% 개선)
---

# Toss Payments SDK useEffect 중복 실행 문제 해결

> useEffect 의존성 최적화 + useRef로 **결제 페이지 로딩 70% 단축**

---

## 0. 개요

:::danger 문제 상황

- 결제 페이지 진입 시 **Toss Payments Widget 로딩에 3~5초 소요**
- 쿠폰/포인트 할인 적용 시 **화면이 깜빡이며 재렌더링**
- 간헐적으로 **"결제 수단을 선택해주세요" 에러** 발생
  :::

:::tip 해결 방향

- **useEffect 의존성 배열 최적화**: SDK 초기화는 마운트 시 1회만
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
2. **두 개의 useEffect가 동시에 실행**
   - SDK 초기화 useEffect + 금액 업데이트 useEffect → Race Condition 발생 가능
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

  // SDK 초기화 (마운트 시 1회만)
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
  }, []); // ✅ 의존성 배열 비움 → 마운트 시 1회만 실행

  return 결제하기;
};
```

**핵심 개선**

- ✅ useEffect 의존성 배열을 비움 (`[]`) → **마운트 시 1회만 실행**
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

- ✅ **서버 응답 후 금액 업데이트** → 클라이언트-서버 금액 일치 보장
- ✅ **결제 버튼 클릭 시 1회만 updateAmount 호출** → Race Condition 제거
- ✅ `paymentMethodsWidget`을 함께 전달 → SDK 호출 안정화

---

## 3. 개선 효과

### 성능 비교

| 항목                      | Before      | After   | 개선율        |
| ------------------------- | ----------- | ------- | ------------- |
| **결제 페이지 로딩**      | 3~5초       | 1초     | **약 70% ↓**  |
| **useEffect 실행 횟수**   | 8~12회      | 1회     | **약 90% ↓**  |
| **화면 깜빡임**           | ✅ 발생     | ❌ 제거 | **100% 개선** |
| **"결제 수단 선택" 에러** | 간헐적 발생 | ❌ 해결 | **100% 개선** |

### 시나리오별 useEffect 실행 횟수

| 작업 흐름   | Before                          | After          |
| ----------- | ------------------------------- | -------------- |
| 페이지 진입 | 2회 (초기화 + 금액 업데이트)    | 1회 (초기화만) |
| 쿠폰 적용   | +2회 (재초기화 + 금액 업데이트) | 0회            |
| 포인트 적용 | +2회                            | 0회            |
| 쿠폰 변경   | +2회                            | 0회            |
| **총계**    | **8~12회**                      | **1회**        |

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
  // SDK 초기화 (마운트 시 1회만)
}, []);
```

**원칙**

- **외부 라이브러리 초기화**: 마운트 시 1회만 (`useEffect([])`)
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

- ✅ **서버가 최종 금액을 계산** → 클라이언트-서버 금액 일치
- ✅ **비동기 작업은 순차적으로 처리** → Race Condition 방지
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
- 결과적으로 **결제 페이지 로딩 시간 단축, 화면 깜빡임 제거, Race Condition 발생 가능성 제거**
  :::

:::tip 배운 점

- **useEffect 의존성 관리의 중요성**
  - 외부 라이브러리는 React의 렌더링 사이클과 분리해서 관리
- **비동기 작업과 Race Condition 처리 경험**
  - 두 개의 useEffect가 동시에 실행되면 **경합 조건** 발생 가능
  - **단일 진입점**(결제 버튼 클릭)에서 모든 작업을 순차적으로 처리
- **useRef의 활용**
  - 리렌더링을 유발하지 않으면서 값을 유지해야 할 때 useRef 사용
    :::

---

## 7. 참고 자료

- [Toss Payments - React 연동 가이드](https://docs.tosspayments.com/reference/widget-sdk)
- [React - useEffect](https://react.dev/reference/react/useEffect)
- [React - useRef](https://react.dev/reference/react/useRef)
