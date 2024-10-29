---
"@clerk/clerk-react": patch
---

Updates `useDerivedAuth()` to correctly derive `has()` from the available auth data. Fixes an issue when `useAuth()` is called during server-side rendering.
