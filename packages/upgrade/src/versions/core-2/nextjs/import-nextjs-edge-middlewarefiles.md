---
title: '`@clerk/nextjs/edge-middlewarefiles` import removed'
category: 'deprecation-removal'
matcher: "@clerk\\/nextjs\\/edge-middlewarefiles"
---

This deprecated import has been replaced by `@clerk/nextjs`. Usage should now look as such: `import { authMiddleware } from @clerk/nextjs`. There may be changes in functionality between the two exports depending on how old the version used is, so upgrade with caution.
