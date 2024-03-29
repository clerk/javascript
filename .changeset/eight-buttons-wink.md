---
'@clerk/localizations': minor
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Improved error handling for registration and retrieval of passkeys.
ClerkRuntimeError codes introduced:
- `passkey_not_supported`
- `passkeys_pa_not_supported`
- `passkey_invalid_rpID_or_domain`
- `passkey_already_exists`
- `passkey_operation_aborted`
- `passkey_retrieval_cancelled`
- `passkey_retrieval_failed`
- `passkey_registration_cancelled`
- `passkey_registration_failed`

Example usage:

```ts
try {
  await __experimental_authenticateWithPasskey(...args);
}catch (e) {
  if (isClerkRuntimeError(e)) {
      if (err.code === 'passkey_operation_aborted') {
          ...
      }
  }
}
      

```
