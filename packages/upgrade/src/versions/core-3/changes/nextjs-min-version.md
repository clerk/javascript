---
title: 'Minimum Next.js version increased to 15.2.8'
packages: ['nextjs']
matcher: "next\":\\s*\"(?:\\^|~|>|=|\\s)*(?:13|14)\\."
matcherFlags: 'm'
category: 'version'
---

Support for Next.js 13 and 14 has been dropped. `@clerk/nextjs` now requires Next.js 15.2.8 or later. On Next.js 16, it requires 16.0.10 or later.

```diff
{
  "dependencies": {
-   "next": "^14.0.0",
+   "next": "^15.2.8",
  }
}
```

See the [Next.js upgrade guide](https://nextjs.org/docs/app/building-your-application/upgrading) for help migrating your application.
