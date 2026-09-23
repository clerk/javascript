---
'@clerk/localizations': minor
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/react': minor
'@clerk/ui': minor
---

Rename the SSO fallback sign-in flow to SSO bypass, matching the name the feature ships under. The sign-in resource's `ssoFallbackFirstFactors` is now `ssoBypassFirstFactors` and reads the `sso_bypass_first_factors` field from the API, the `signIn.ssoFallback` localization keys are now `signIn.ssoBypass`, and the `ssoFallback` card action element id is now `ssoBypass`. The flow has not been enabled on any instance, so no application is affected by the old names going away.
