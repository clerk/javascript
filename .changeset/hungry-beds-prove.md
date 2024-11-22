---
'@clerk/clerk-js': minor
---

Drop experimental tag related to reverification.

Properties of Clerk class:
- `__experimental_openUserVerification` -> `__internal_openUserVerification`
- `__experimental_closeUserVerification` -> `__internal_closeUserVerification`
- `__experimental_UserVerificationProps` -> `__internal_UserVerificationProps`
- `__experimental_UserVerificationModalProps` -> `__internal_UserVerificationModalProps`

Properties of `Session`:
- `__experimental_factorVerificationAge` -> `factorVerificationAge`
- `__experimental_startVerification` -> `startVerification`
- `__experimental_prepareFirstFactorVerification` -> `prepareFirstFactorVerification`
- `__experimental_attemptFirstFactorVerification` -> `attemptFirstFactorVerification`
- `__experimental_prepareSecondFactorVerification` -> `prepareSecondFactorVerification`
- `__experimental_attemptSecondFactorVerification` -> `attemptSecondFactorVerification`
