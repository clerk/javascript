---
title: '`useCheckout` and `Clerk.checkout()` return value changed'
matcher:
  - 'useCheckout'
  - 'Clerk\\.checkout'
  - '\\.checkout\\('
category: 'breaking'
---

The return values of `useCheckout` hook and `Clerk.checkout()` have been updated.

### React Hook

```diff
- const { id, plan, status, start, confirm, paymentSource } = useCheckout({ planId: "xxx", planPeriod: "annual" });
+ const { checkout, errors, fetchStatus } = useCheckout({ planId: "xxx", planPeriod: "annual" });
+ // Access properties via checkout object
+ checkout.plan
+ checkout.status
+ checkout.start()
+ checkout.confirm()
```

### Vanilla JS

```diff
- const { getState, subscribe, confirm, start, clear, finalize } = Clerk.checkout({ planId: "xxx", planPeriod: "annual" });
- getState().isStarting
- getState().checkout
+ const { checkout, errors, fetchStatus } = Clerk.checkout({ planId: "xxx", planPeriod: "annual" });
+ checkout.plan
+ checkout.status
+ checkout.start()
+ checkout.confirm()
```
