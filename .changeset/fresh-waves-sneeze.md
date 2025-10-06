---
"@clerk/react-router": minor
---

Added `organizationSyncOptions` option to `clerkMiddleware()`. It's used to activate a specific organization or personal account based on URL path parameters.

Usage:

```ts
// app/root.tsx
export const middleware: Route.MiddlewareFunction[] = [
  clerkMiddleware({
    organizationSyncOptions: {
      organizationPatterns: [
        '/orgs/:slug', // Match the org slug
        '/orgs/:slug/(.*)', // Wildcard match for optional trailing path segments
      ],
    }
  })
]
```

To learn more about best practices for using organization slugs to manage the active organization, check out this [guide](https://clerk.com/docs/organizations/org-slugs-in-urls).
