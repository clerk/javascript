---
'@clerk/clerk-js': major
'@clerk/shared': major
'@clerk/react': major
---

Updated returned values of `Clerk.checkout()` and `useCheckout`.

### Vanilla JS
```ts
// Before
const { getState, subscribe, confirm, start, clear, finalize  } = Clerk.checkout({ planId: "xxx", planPeriod: "annual" })
getState().isStarting
getState().isConfirming
getState().error
getState().checkout
getState().fetchStatus
getState().status

// After
const { checkout, errors, fetchStatus } = Clerk.checkout({ planId: "xxx", planPeriod: "annual" })
checkout.plan // null or defined based on `checkout.status`
checkout.status
checkout.start
checkout.confirm
```

### React
```ts
// Before
const { id, plan, status, start, confirm, paymentSource } = useCheckout({ planId: "xxx", planPeriod: "annual" })

// After
const { checkout, errors, fetchStatus } = usecCheckout({ planId: "xxx", planPeriod: "annual" })
checkout.plan // null or defined based on `checkout.status`
checkout.status
checkout.start
checkout.confirm
```