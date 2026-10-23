---
"@clerk/clerk-js": patch
"@clerk/shared": patch
---

Email address link flows now accept an optional `onPrepared` callback that runs after the verification email is prepared, while the returned promise still waits for verification. Cancelling during preparation prevents subsequent polling.
