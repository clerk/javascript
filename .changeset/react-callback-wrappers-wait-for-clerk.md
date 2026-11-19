---
'@clerk/react': patch
---

`handleRedirectCallback()` and `handleGoogleOneTapCallback()` from `useClerk()` now match the Clerk JS methods they wrap. The returned promise settles only after Clerk finishes handling the callback, including when you call them before Clerk has loaded. Both methods now pass the optional `customNavigate` argument through to Clerk. They also reject when the callback fails instead of silently swallowing the error, so add error handling (`try`/`catch` around `await`, or `.catch()`) where you call them. A `handleRedirectCallback()` call made while an earlier one is still running returns the result of the earlier call instead of starting a second OAuth transfer, and its own arguments are ignored. `<AuthenticateWithRedirectCallback />` behaves as before.
