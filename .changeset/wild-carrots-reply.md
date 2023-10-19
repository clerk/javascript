---
"@clerk/shared": major
---

The package was reworked to allow for better isomorphic use cases and ESM support, resulting in some breaking changes. It now allows for [subpath exports](https://nodejs.org/api/packages.html#subpath-exports) and restricts some imports to specific subpaths.

Instead of importing from the root `@clerk/shared` import you can now use subpaths for most things:

```diff
- import { deprecated, OrganizationProvider } from "@clerk/shared"
+ import { deprecated } from "@clerk/shared/deprecated"
+ import { OrganizationProvider } from "@clerk/shared/react"
```

By using subpaths you can tell bundlers to only bundle specific parts, potentially helping with tree-shaking. It also mitigates issues where e.g. modules only relevant for React where picked up in Node.js-only environments.

If you're not using `@clerk/shared` directly (only by proxy through e.g. `@clerk/clerk-react`) you don't need to do anything. If you are relying on `@clerk/shared`, please read through the breaking changes below and change your code accordingly. You can rely on your IDE to give you hints on which exports are available at `@clerk/shared` and `@clerk/shared/<name>` subpaths.

**Breaking Changes**

- `@clerk/shared` was and still is a dual CJS/ESM package. The ESM files provided by `@clerk/shared` now use `.mjs` file extensions and also define them in their import paths, following the ESM spec. Your bundler should handle this for you.
- Some imports where moved from the root `@clerk/shared` import to isolated subpaths.
  - Helper utils for cookies and globs:

    ```diff
    - import { createCookieHandler, globs } from "@clerk/shared"
    + import { createCookieHandler } from "@clerk/shared/cookie"
    + import { globs } from "@clerk/shared/globs"
    ```
  - Everything related to React. Below is a small example and the full list of exports:

    ```diff
    - import { useSafeLayoutEffect, ClerkInstanceContext } from "@clerk/shared"
    + import { useSafeLayoutEffect, ClerkInstanceContext } from "@clerk/shared/react"
    ```

    Full list of exports moved to `@clerk/shared/react`:

    ```ts
    export {
      ClerkInstanceContext,
      ClientContext,
      OrganizationContext,
      OrganizationProvider,
      SessionContext,
      UserContext,
      assertContextExists,
      createContextAndHook,
      useClerkInstanceContext,
      useClientContext,
      useOrganization,
      useOrganizationContext,
      useOrganizationList,
      useOrganizations,
      useSafeLayoutEffect,
      useSessionContext,
      useUserContext
    }
    ```

If you run into an issues that might be a bug, please [open a bug report](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml) with a minimal reproduction.
