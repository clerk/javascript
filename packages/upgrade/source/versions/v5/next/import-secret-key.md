---
title: '`SECRET_KEY` constant removed'
matcher: "SECRET_KEY[\\s\\S]*?from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
matcherFlags: 'm'
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. We recommend setting the `CLERK_SECRET_KEY` environment variable and using this instead.
