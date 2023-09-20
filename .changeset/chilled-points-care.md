---
'@clerk/remix': major
---

Remix released its second major version. Read their [announcement blogpost](https://remix.run/blog/remix-v2) and [upgrade guide](https://remix.run/docs/en/main/start/v2) to learn more.

Thus `@clerk/remix` was updated to support Remix `^2.0.0` and later. If you want/need to continue using Remix `^1.0.0`, keep using the previous major `@clerk/remix` version.

**Migration guide:**

- Rename `V2_ClerkErrorBoundary` to `ClerkErrorBoundary`

    ```diff
    - import { ClerkApp, V2_ClerkErrorBoundary } from "@clerk/remix";
    + import { ClerkApp, ClerkErrorBoundary } from "@clerk/remix";

    - export const ErrorBoundary = V2_ClerkErrorBoundary();
    + export const ErrorBoundary = ClerkErrorBoundary();
    ```

- Replace `ClerkCatchBoundary` with `ClerkErrorBoundary`. If you used `V2_ClerkErrorBoundary` you can skip this step.

    ```diff
    - import { ClerkApp, ClerkCatchBoundary } from '@clerk/remix';
    + import { ClerkApp, ClerkErrorBoundary } from "@clerk/remix";

    - export const CatchBoundary = ClerkCatchBoundary();
    + export const ErrorBoundary = ClerkErrorBoundary();
    ```
