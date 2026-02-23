---
title: 'Minimum Next.js version increased to 15.2.3'
packages: ['nextjs']
matcher: "next\":\\s*\"(?:\\^|~|>|=|\\s)*(?:13|14)\\."
matcherFlags: 'm'
category: 'version'
---

Support for Next.js 13 and 14 has been dropped. `@clerk/nextjs` now requires `next@>=15.2.3`.

```diff
{
  "dependencies": {
-   "next": "^14.0.0",
+   "next": "^15.2.3",
  }
}
```

See the [Next.js upgrade guide](https://nextjs.org/docs/app/building-your-application/upgrading) for help migrating your application.
