---
title: '`clerkJSVariant` prop removed'
matcher:
  - 'clerkJSVariant'
  - 'headless'
category: 'deprecation-removal'
---

The `clerkJSVariant` prop has been removed. Use `prefetchUI={false}` instead to disable prefetching the UI bundle. The UI will still be loaded on-demand when needed, but won't be prefetched during initial page load.

A codemod is available to automatically apply this change:

```diff
<ClerkProvider
- clerkJSVariant="headless"
+ prefetchUI={false}
  publishableKey={...}
>
```

You can also disable UI prefetching via environment variable:

- Next.js: `NEXT_PUBLIC_CLERK_PREFETCH_UI=false`
- Astro: `PUBLIC_CLERK_PREFETCH_UI=false`
- React Router / TanStack Start: `CLERK_PREFETCH_UI=false`
