---
'@clerk/clerk-sdk-node': major
'@clerk/backend': major
'@clerk/nextjs': major
---

Changes in `@clerk/backend` exports:
- Drop Internal `deserialize` helper
- Introduce `/errors` subpath export, eg:
    ```typescript
    import { 
        TokenVerificationError,
        TokenVerificationErrorAction,
        TokenVerificationErrorCode,
        TokenVerificationErrorReason } from '@clerk/backend/errors';
    ```
- Drop errors from top-level export
    ```typescript
    // Before
    import { TokenVerificationError, TokenVerificationErrorReason } from '@clerk/backend';
    // After
    import { TokenVerificationError, TokenVerificationErrorReason } from '@clerk/backend/errors';
    ```
