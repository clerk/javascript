---
'@clerk/expo': minor
---

Add `useBiometricCredentials().reverify()` for first-, second-, and multi-factor verification of the active session on iOS and Android. Successful verification refreshes the JavaScript session token without creating a new session.

New biometric enrollments default to `biometry_current_set`, requiring biometrics without device-passcode fallback. Existing credentials keep their original policy; Android reverification requires the stronger policy and returns `biometric_credential_policy_incompatible` for older, weaker credentials. Apps should offer another verification method in that case. Reverification requires an updated native development build.
