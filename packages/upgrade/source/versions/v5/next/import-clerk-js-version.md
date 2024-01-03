---
title: '`CLERK_JS_VERSION` constant removed'
matcher: "CLERK_JS_VERSION.*?from\\s['\"]@clerk\\/nextjs['\"]"
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. We recommend setting the `NEXT_PUBLIC_CLERK_JS_VERSION` environment variable and using this instead.
