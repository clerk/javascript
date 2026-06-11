---
'@clerk/shared': minor
'@clerk/clerk-js': minor
'@clerk/ui': minor
---

Add an internal OAuth transport (`__internal_oauthTransport`) so native desktop SDK wrappers can run Clerk's prebuilt OAuth/SSO flows through a system browser. Existing redirect and popup behavior is unchanged when no transport is registered.
