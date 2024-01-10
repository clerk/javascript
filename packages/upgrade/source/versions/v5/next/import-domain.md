---
title: '`DOMAIN` constant removed'
matcher: "DOMAIN[\\s\\S]*?from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
matcherFlags: 'm'
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. We recommend setting the `NEXT_PUBLIC_CLERK_DOMAIN` environment variable and using this instead.
