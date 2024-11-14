---
'@clerk/shared': minor
'@clerk/types': minor
---

Update reverification config values to snake_case.

For `__experimental_ReverificationConfig`
- `strictMfa` changes to `strict_mfa`

For `__experimental_SessionVerificationLevel`
- `firstFactor` changes to `first_factor`
- - `secondFactor` changes to `second_factor`
- - `multiFactor` changes to `multi_factor`
