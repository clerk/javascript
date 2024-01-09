---
'@clerk/clerk-react': patch
---

Fixes error when path is passed from context and a routing strategy other than `path` is passed as a prop.
This change affects  components `<SignIn />`, `<SignUp />` from `@clerk/nextjs` and `@clerk/remix`.
