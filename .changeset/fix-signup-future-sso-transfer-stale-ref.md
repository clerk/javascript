---
"@clerk/clerk-js": patch
---

Fix `signUp.update()` sending a PATCH request to `/client/sign_ups` instead of `/client/sign_ups/{id}` after an SSO sign-in transitions to a sign-up flow (e.g. when legal acceptance is required). The `SignUpFuture` reference held by hooks is now preserved across the transition and reflects the correct sign-up id.
