---
'@clerk/clerk-js': patch
---

Fixes an issue during sign-up flow where a user lands on the continue step, and proceeds successfully through the sign-up process and gets redirected to AP sign-up due to signUp.id being undefined.
