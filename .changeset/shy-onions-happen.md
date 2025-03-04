---
'@clerk/astro': minor
'@clerk/clerk-react': minor
'@clerk/types': minor
'@clerk/vue': minor
---

Update `has` from `useAuth()` to always be a function.
Previously `has` would be `undefined` when `isLoaded:false`, now it will be a function that always returns false.
