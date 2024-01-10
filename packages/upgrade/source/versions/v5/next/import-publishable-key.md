---
title: '`PUBLISHABLE_KEY` constant removed'
matcher: "PUBLISHABLE_KEY[\\s\\S]*?from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
matcherFlags: 'm'
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. We recommend setting the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` environment variable and using this instead.
