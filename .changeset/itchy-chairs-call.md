---
'@clerk/remix': major
---

Update `@clerk/remix`'s `rootAuthLoader` and `getAuth` helpers to handle handshake auth status, this replaces the previous interstitial flow. As a result of this, the `ClerkErrorBoundary` is no longer necessary and has been removed.

To migrate, remove usage of `ClerkErrorBoundary`:

```diff
- import { ClerkApp, ClerkErrorBoundary } from "@clerk/remix";
+ import { ClerkApp } from "@clerk/remix";

...

- export const ErrorBoundary = ClerkErrorBoundary();
```
