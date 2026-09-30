---
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Add experimental support for trusted device (biometric credential) resources in native apps:

- `signIn.create({ strategy: 'trusted_device', trustedDeviceId })` and `signIn.attemptFirstFactor({ strategy: 'trusted_device', trustedDeviceId, clientData, signature, algorithm: 'ES256' })` are now typed and supported. The challenge to sign is exposed on `signIn.firstFactorVerification.trustedDeviceChallenge`.
- Session reverification accepts the `trusted_device` strategy: `session.prepareFirstFactorVerification()` and `session.prepareSecondFactorVerification()` take `{ strategy: 'trusted_device', trustedDeviceId }`, and the matching attempt methods take the signed challenge. The challenge is exposed on the verification's `trustedDeviceChallenge`.
- `User` gains `__experimental_getBiometricCredentials()`, `__experimental_prepareBiometricCredential()`, `__experimental_attemptBiometricCredential()` and `__experimental_revokeBiometricCredential()` for managing a user's enrolled biometric credentials.
- The environment's auth config now exposes `nativeSettings`, indicating whether trusted device sign-in and enrollment prompts are enabled.

These APIs are experimental and may change in future minor releases.
