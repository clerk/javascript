---
title: 'ClerkProvider should be inside `<body>` for Next.js cache components'
matcher: '<ClerkProvider[^>]*>\\s*<html'
matcherFlags: 'm'
category: 'warning'
packages:
  - nextjs
---

For Next.js 16 cache components support (`cacheComponents: true`), `ClerkProvider` must be positioned inside `<body>` rather than wrapping `<html>`. This prevents "Uncached data was accessed outside of `<Suspense>`" errors.

```diff
-<ClerkProvider>
-  <html lang="en">
-    <body>{children}</body>
-  </html>
-</ClerkProvider>
+<html lang="en">
+  <body>
+    <ClerkProvider>
+      {children}
+    </ClerkProvider>
+  </body>
+</html>
```

This change is automatically applied by the upgrade CLI:

```bash
npx @clerk/upgrade --release core-3
```

Without the `dynamic` prop, `ClerkProvider` doesn't need a `<Suspense>` boundary, but with `cacheComponents: true`, the code under it that reads the request does. That includes `<Show>`, `auth()`, `currentUser()`, and `<SignIn />`, `<SignUp />`, `<UserProfile />`, and `<OrganizationProfile />` on catch-all routes. See [Cache Components](https://clerk.com/docs/guides/development/rendering-modes#cache-components) for where to add the boundaries.
