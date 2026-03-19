---
'@clerk/expo': patch
---

Fix SSO/OAuth browser not being dismissed after authentication completes. On some platforms the in-app browser would remain open in the background after a successful flow, causing subsequent sign-in attempts to fail or appear frozen. `WebBrowser.dismissBrowser()` is now called unconditionally after `openAuthSessionAsync` resolves in both `useSSO` and `useOAuth`.
