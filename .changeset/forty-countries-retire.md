---
'@clerk/shared': minor
---

Introduce the `useReverification()` hook that handles the session reverification flow:
- `__experimental_useReverification` -> `useReverification`
Also replaces the following APIs:
- `__experimental_reverificationError` -> `reverificationError`
- `__experimental_reverificationErrorResponse` -> `reverificationErrorResponse`
- `__experimental_isReverificationHint` -> `isReverificationHint`
