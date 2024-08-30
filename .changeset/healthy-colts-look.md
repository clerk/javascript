---
"@clerk/clerk-js": minor
---

Add new `UserVerification` component (experimental feature). This UI component allows for a user to "re-enter" their credentials (first factor and/or second factor) which results in them being re-verified.

New methods have been added:

- `__experimental_openUserVerification()`
- `__experimental_closeUserVerification()`
- `__experimental_mountUserVerification(targetNode: HTMLDivElement)`
- `__experimental_unmountUserVerification(targetNode: HTMLDivElement)`
