---
'gatsby-plugin-clerk': major
'@clerk/clerk-sdk-node': major
'@clerk/backend': major
'@clerk/fastify': major
'@clerk/nextjs': major
'@clerk/remix': major
---

Changes in exports of `@clerk/backend`:
- Expose the following helpers and enums from `@clerk/backend/internal`:
    ```typescript
        import { 
            AuthStatus,
            buildRequestUrl,
            constants,
            createAuthenticateRequest,
            createIsomorphicRequest,
            debugRequestState,
            makeAuthObjectSerializable,
            prunePrivateMetadata,
            redirect,
            sanitizeAuthObject,
            signedInAuthObject,
            signedOutAuthObject } from '@clerk/backend/internal';
    ```
- Drop the above exports from the top-level api:
    ```typescript
    // Before
    import { AuthStatus, ... } from '@clerk/backend';
    // After
    import { AuthStatus, ... } from '@clerk/backend/internal';
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.