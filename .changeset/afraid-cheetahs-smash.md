---
'@clerk/nextjs': minor
---

Introduce the `useReverification()` hook that handles the session reverification flow:
- Replaces `__experimental_useReverification` with `useReverification`
Also replaces the following APIs:
- `____experimental_reverificationError` -> `__reverificationError`
- `__experimental_reverificationErrorResponse` -> `reverificationErrorResponse`
