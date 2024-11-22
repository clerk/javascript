---
'@clerk/types': minor
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

Renaming 
- `__experimental_SessionVerificationResource` -> `SessionVerificationResource`
- `__experimental_SessionVerificationStatus` -> `SessionVerificationStatus`
- `__experimental_SessionVerificationLevel` -> `SessionVerificationLevel`
- `__experimental_ReverificationConfig` -> `ReverificationConfig`

`CheckAuthorizationParamsWithCustomPermissions` and `CheckAuthorizationParams` now include `reverification?: ReverificationConfig;`

Properties of  `IntialState`:
- `__experimental_factorVerificationAge` -> `factorVerificationAge`

Localization types:
All properties of `__experimental_userVerification` are moved to `userVerification` 
