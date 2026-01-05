---
"@clerk/ui": patch
---

Fix redirect conflicts when SignIn and SignUp components are used together on the same page. Added missing dependency arrays to useEffect hooks in redirect functions to prevent unwanted redirects during other component flows.