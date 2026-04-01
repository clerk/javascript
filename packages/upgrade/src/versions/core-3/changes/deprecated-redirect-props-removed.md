---
title: 'Legacy redirect props removed'
matcher:
  - 'afterSignInUrl'
  - 'afterSignUpUrl'
  - 'afterSignOutUrl'
  - 'redirectUrl'
category: 'deprecation-removal'
---

The legacy redirect props `afterSignInUrl`, `afterSignUpUrl`, and `redirectUrl` have been removed from components. Use the newer redirect options:

```diff
<SignIn
- afterSignInUrl="/dashboard"
- afterSignUpUrl="/onboarding"
+ fallbackRedirectUrl="/dashboard"
+ signUpFallbackRedirectUrl="/onboarding"
/>
```

For forced redirects that ignore the `redirect_url` query parameter:

```diff
<SignIn
+ forceRedirectUrl="/dashboard"
+ signUpForceRedirectUrl="/onboarding"
/>
```
