---
'@clerk/ui': patch
---

Fix configured OIDC prompts being ignored by sign-up continuations, including enterprise SSO after email-link verification or direct combined-flow transfer and OAuth sign-ups embedded in `<SignIn withSignUp>`.
