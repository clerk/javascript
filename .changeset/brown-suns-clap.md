---
"@clerk/astro": patch
"@clerk/nextjs": patch
"@clerk/shared": patch
---

Previously the `createPathMatcher()` function was re-implemented both in `@clerk/astro` and `@clerk/nextjs`, this PR moves this logic to `@clerk/shared`.

You can use it like so:

```ts
import { createPathMatcher } from '@clerk/shared/pathMatcher'
```
