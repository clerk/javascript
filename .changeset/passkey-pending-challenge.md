---
'@clerk/clerk-js': patch
---

Reuse a pending passkey challenge when `authenticateWithPasskey` runs again with the `autofill` or `discoverable` flow, instead of creating a new sign-in attempt on every call. A sign-in form that mounts several times in a row no longer issues one `POST /v1/client/sign_ins` per mount.
