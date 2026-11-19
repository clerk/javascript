---
'@clerk/react': patch
---

`handleRedirectCallback()` and `handleGoogleOneTapCallback()` from `useClerk()` now match the Clerk JS methods they wrap. The returned promise settles only after Clerk finishes handling the callback, including when you call them before Clerk has loaded. Both methods now pass the optional `customNavigate` argument through to Clerk. They also reject when the callback fails instead of silently swallowing the error, so add error handling (`try`/`catch` around `await`, or `.catch()`) where you call them. `<AuthenticateWithRedirectCallback />` behaves as before.
