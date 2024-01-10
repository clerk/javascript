---
title: '`IS_SATELLITE` constant removed'
matcher: "IS_SATELLITE[\\s\\S]*?from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
matcherFlags: 'm'
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. We recommend setting the `NEXT_PUBLIC_CLERK_IS_SATELLITE` environment variable and using this instead.
