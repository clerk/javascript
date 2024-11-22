---
'@clerk/clerk-js': minor
---

Drop experimental tag related to reverification.

Properties of Clerk class:
- `__experimental_openUserVerification` -> `__internal_openReverification`
- `__experimental_closeUserVerification` -> `__internal_closeReverification`
- `__experimental_UserVerificationProps` -> `__internal_ReverificationProps`
- `__experimental_UserVerificationModalProps` -> `__internal_ReverificationModalProps`

Properties of `Session`:
- `__experimental_factorVerificationAge` -> `factorVerificationAge`
- `__experimental_startVerification` -> `startVerification`
- `__experimental_prepareFirstFactorVerification` -> `prepareFirstFactorVerification`
- `__experimental_attemptFirstFactorVerification` -> `attemptFirstFactorVerification`
- `__experimental_prepareSecondFactorVerification` -> `prepareSecondFactorVerification`
- `__experimental_attemptSecondFactorVerification` -> `attemptSecondFactorVerification`
