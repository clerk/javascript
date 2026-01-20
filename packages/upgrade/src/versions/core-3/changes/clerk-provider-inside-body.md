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

If you're using Next.js 16 with `cacheComponents: true`, you may also need to wrap `ClerkProvider` in a `<Suspense>` boundary.
