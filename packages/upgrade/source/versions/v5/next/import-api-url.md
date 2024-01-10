---
title: '`API_URL` constant removed'
matcher: "API_URL[\\s\\S]*?from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
matcherFlags: 'm'
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. We recommend setting the `CLERK_API_URL` environment variable and using this instead.
