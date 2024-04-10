---
'@clerk/localizations': minor
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Move passkey related apis to stable:

- Register passkey for a user
  Usage: `await clerk.user.createPasskey()`
- Authenticate with passkey
  Usage: `await clerk.client.signIn.authenticateWithPasskey()`
  ```ts
  try {
    await clerk.client.signIn.authenticateWithPasskey(...args);
  }catch (e) {
    if (isClerkRuntimeError(e)) {
        if (err.code === 'passkey_operation_aborted') {
            ...
        }
    }
  }
  ```
- ClerkRuntimeError codes introduced:
  - `passkey_not_supported`
  - `passkeys_pa_not_supported`
  - `passkey_invalid_rpID_or_domain`
  - `passkey_already_exists`
  - `passkey_operation_aborted`
  - `passkey_retrieval_cancelled`
  - `passkey_retrieval_failed`
  - `passkey_registration_cancelled`
  - `passkey_registration_failed`

- Get the user's passkeys
  `clerk.user.passkeys`
- Update the name of a passkey
  `clerk.user.passkeys?.[0].update({name:'Company issued passkey'})`
- Delete a passkey
  `clerk.user.passkeys?.[0].delete()`
