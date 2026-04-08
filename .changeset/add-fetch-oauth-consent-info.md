---
'@clerk/shared': patch
'@clerk/clerk-js': patch
'@clerk/react': patch
---

Add `Clerk.fetchOAuthConsentInfo()` to load OAuth authorization consent metadata for the active session, plus `OAuthConsentInfo`, `OAuthConsentScope`, and `FetchOAuthConsentInfoParams` types. `useClerk()` delegates via `IsomorphicClerk`.
