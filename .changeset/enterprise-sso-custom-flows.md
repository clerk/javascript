---
'@clerk/shared': minor
'@clerk/clerk-js': minor
'@clerk/ui': patch
'@clerk/expo': minor
---

Support connection selection in custom Enterprise SSO flows. `enterpriseConnectionId`, the enterprise first-factor fields, and `signUp.getEnterpriseConnections()` are stable. The experimental sign-up method remains available as a deprecated alias. Use `isEnterpriseConnectionAmbiguousError` from `@clerk/shared/error` to recognize a flow that needs a connection selection.

Expo `startSSOFlow()` accepts `enterpriseConnectionId`. When multiple connections match and no ID is supplied, it returns the sign-in resource without opening a browser. Render the matching `supportedFirstFactors` and call the hook again with the selected ID.
