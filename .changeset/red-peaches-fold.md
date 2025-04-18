---
'@clerk/localizations': patch
'@clerk/clerk-js': patch
'@clerk/clerk-react': patch
'@clerk/types': patch
---

Add `<SubscriptionsList />` to both UserProfile and OrgProfile components.

Introduce experimental method for opening `<SubscriptionDetails />` component.

```tsx
clerk.__experimental_openSubscriptionDetails(...)
```
