---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Add shared mobile SSO orchestration for prebuilt authentication screens. Preserve Apple names and reuse one Apple credential when restricted sign-up requires a sign-in fallback, while leaving session finalization explicit.
