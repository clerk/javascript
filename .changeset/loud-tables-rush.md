---
'@clerk/clerk-js': patch
---

A bug was fixed to not override the existing sign-up state on the OAuth callback.

When continuing a sign-up flow with social connections, `@clerk/clerk-js` was creating a new `SignUpResource` object, instead of patching the existing one.

This was affecting Web3 sign-up flows, since the wallet ID was being overridden on the browser redirect.
