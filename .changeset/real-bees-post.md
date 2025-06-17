---
'@clerk/clerk-js': patch
---

Reworked the cache key creation logic in SignInFactorOneCodeForm.tsx not to rely on sign_in.id, which can change after host app re-renders
