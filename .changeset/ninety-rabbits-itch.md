---
"@clerk/shared": minor
---

Introduce experimental reverification error helpers.
- `reverificationMismatch` returns the error as an object which can later be used as a return value from a React Server Action.
- `reverificationMismatchResponse` returns a Response with the above object serialized. It can be used in any Backend Javascript frameworks that supports `Response`.  
