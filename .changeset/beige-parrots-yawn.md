---
'@clerk/tanstack-start': minor
---

**Breaking change:** Update `@tanstack/react-router` peer dependency from `>=1.49.1` to `>=1.81.9`. Also update `@tanstack/start` peer dependency from `>=1.49.1` to `>=1.81.9`. This update coincides with the [changed server function syntax & server middleware](https://github.com/TanStack/router/pull/2513) that will allow the SDK more functionality in the future.

When updating your `@clerk/tanstack-start` version you'll need to change various pieces in your code, Clerk's documentation ([quickstart](https://clerk.com/docs/quickstarts/tanstack-start), [reference](https://clerk.com/docs/references/tanstack-start/overview)) has been updated to account for that.
