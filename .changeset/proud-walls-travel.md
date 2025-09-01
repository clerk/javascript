---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/types': minor
---

[Billing Beta] `checkout.confirm()` now infers the resource id resulting in less repetition and improved DX.

After
```tsx
const checkout = Clerk.billing.startCheckout({orgId})
checkout.confirm() // orgId is always implied
```

Before
```tsx
const checkout = clerk.billing.startCheckout({orgId})
checkout.confirm({orgId})
```
