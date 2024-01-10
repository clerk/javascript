---
title: '`CLERK_JS_VERSION` constant removed'
matcher: "CLERK_JS_VERSION[\\s\\S]*?from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
matcherFlags: 'm'
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. We recommend setting the `NEXT_PUBLIC_CLERK_JS_VERSION` environment variable and using this instead.
