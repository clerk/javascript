---
'@clerk/localizations': minor
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Add the SSO fallback sign-in flow to `<SignIn />`, for enterprise users the instance has allowlisted to sign in with an email code when they cannot reach their identity provider.

For such a user the sign-in no longer redirects straight to the identity provider. It shows the SSO action — or the connection picker, when several connections serve the address — alongside a "Can't use SSO?" link leading to the standard email code step, which carries a notice that the organization requires single sign-on and that the attempt is recorded. Users without a fallback, and instances without the feature, are unaffected.

Custom flows can read the same factor from the new `ssoFallbackFirstFactors` property on the sign-in resource. The flow adds the `signIn.enterpriseSSO` and `signIn.ssoFallback` localization keys and the `ssoFallback` card action element id.
