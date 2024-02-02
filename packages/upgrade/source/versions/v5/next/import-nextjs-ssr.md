---
title: '`@clerk/nextjs/ssr` import removed'
matcher: "@clerk\\/nextjs\\/ssr"
category: 'deprecation-removal'
replaceWithString: '@clerk/nextjs'
---

If you are importing from `@clerk/nextjs/ssr`, you can use `@clerk/nextjs` instead. Our top-level import supports SSR functionality by default now, so the subpath on the import is no longer needed. This import can be directly replaced without any other considerations.
