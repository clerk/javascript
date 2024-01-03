---
title: '`SECRET_KEY` constant removed'
matcher: "SECRET_KEY.*?from\\s['\"]@clerk\\/nextjs['\"]"
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. We recommend setting the `CLERK_SECRET_KEY` environment variable and using this instead.
