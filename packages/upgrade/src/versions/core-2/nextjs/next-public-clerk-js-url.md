---
title: '`NEXT_PUBLIC_CLERK_JS` should be `NEXT_PUBLIC_CLERK_JS_URL`'
category: 'deprecation-removal'
matcher: 'NEXT_PUBLIC_CLERK_JS[^_]*$'
---

If you are using `NEXT_PUBLIC_CLERK_JS` as an environment variable, it should be changed to `NEXT_PUBLIC_CLERK_JS_URL` instead. This variable was renamed for consistency across public APIs. Make sure to also check your production host configuration when changing environment variable values.
