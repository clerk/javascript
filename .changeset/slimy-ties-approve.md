---
'@clerk/clerk-sdk-node': major
'@clerk/backend': major
'@clerk/nextjs': major
---

Changes in exports of `@clerk/backend`:
- Expose the following helpers and enums from `@clerk/backend/jwt`:
    ```typescript
        import { 
            decodeJwt,
            hasValidSignature,
            signJwt,
            verifyJwt } from '@clerk/backend/jwt';
    ```
- Drop the above exports from the top-level api:
    ```typescript
    // Before
    import { decodeJwt, ... } from '@clerk/backend';
    // After
    import { decodeJwt, ... } from '@clerk/backend/jwt';
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.
