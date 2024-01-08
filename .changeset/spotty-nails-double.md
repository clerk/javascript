---
'@clerk/clerk-react': patch
---

Fixes error thrown for missing path & routing props when path was passed from context.
This change affects  components `<SignIn />`, `<SignUp />` from `@clerk/nextjs` and `@clerk/remix`.