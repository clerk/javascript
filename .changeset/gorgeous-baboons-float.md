---
'@clerk/clerk-expo': major
---

Drop deprecations. Migration steps:
- use `CLERK_PUBLISHABLE_KEY` instead of `CLERK_FRONTEND_API` env variable
- use `publishableKey` instead of `frontendApi`
- use `isEmailLinkError` instead of `isMagicLinkError`
- use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
- use `useEmailLink` instead of `useMagicLink`