---
'@clerk/clerk-react': major
'@clerk/chrome-extension': major
---

Drop deprecations. Migration steps:
- use `setActive` instead of `setSession` from `useSessionList | useSignUp | useSignIn` hooks
- use `publishableKey` instead of `frontendApi`
- use `handleEmailLinkVerification` instead of `handleMagicLinkVerification` from `IsomorphicClerk`
- use `isEmailLinkError` instead of `isMagicLinkError`
- use `EmailLinkErrorCode` instead of `MagicLinkErrorCode`
- use `useEmailLink` instead of `useMagicLink`