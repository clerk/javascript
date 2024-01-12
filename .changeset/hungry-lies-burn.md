---
"@clerk/nextjs": patch
---

Introduce `createRouteMatcher` which is designed to generate and return a function that evaluates whether a given Request object matches a set of predefined routes. It provides flexibility in defining these routes through various patterns, including glob patterns, regular expressions, and custom functions. This composable helper can be used in combination with the `clerkMiddleware` helper to easily protect specific routes, eg:
```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    auth().protect();
  }
});
```
