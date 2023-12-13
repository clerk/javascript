---
'gatsby-plugin-clerk': major
'@clerk/chrome-extension': major
'@clerk/nextjs': major
'@clerk/clerk-react': major
'@clerk/remix': major
'@clerk/clerk-expo': major
---

- Introduce `@clerk/clerk-react/errors` and `@clerk/clerk-react/internal` subpath exports to expose some internal utilities. Eg
    ```typescript
    // Before
    import { __internal__setErrorThrowerOptions } from '@clerk/clerk-react';
    // After
    import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';

    // Before
    import { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react';
    // After
    import { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react/errors';

    // Before
    import { MultisessionAppSupport } from '@clerk/clerk-react';
    // After
    import { MultisessionAppSupport } from '@clerk/clerk-react/internal';
    ```
- Drop from the `@clerk/clerk-react` and all other clerk-react wrapper packages:
    - `__internal__setErrorThrowerOptions` internal utility (moved to /internal subpath)
    - `WithClerkProp` type
    - `MultisessionAppSupport` component (moved to /internal subpath)
    - `EmailLinkErrorCode` enum
- Drop `StructureContext` and related errors to reduce to reduce code complexity since it seems that it was not being used.
- Drop `withUser`, `WithUser`, `withClerk` HOFs and `WithClerk`, `withSession`, `WithSession` HOCs from the `@clerk/clerk-react` 
  to reduce the export surface since it's trivial to implement if needed.
