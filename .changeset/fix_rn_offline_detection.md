---
"@clerk/shared": patch
---

Fix false offline detection in React Native by checking `navigator.product` and `typeof navigator.onLine` before treating the environment as disconnected
