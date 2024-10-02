---
"@clerk/clerk-js": minor
"@clerk/shared": minor
"@clerk/clerk-react": minor
"@clerk/types": minor
---

Rename `__experimental_assurance` to `__experimental_reverification`.

- Supported levels are now are `firstFactor`, `secondFactor`, `multiFactor`.
- Support maxAge is now replaced by maxAgeMinutes and afterMinutes depending on usage.
- Introduced `____experimental_SessionVerificationTypes` that abstracts away the level and maxAge
  - Allowed values 'veryStrict' | 'strict' | 'moderate' | 'lax'
