---
title: '`API_VERSION` constant removed'
matcher: "import\\s+{[\\s\\S]*?API_VERSION[\\s\\S]*?from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
category: 'deprecation-removal'
matcherFlags: 'm'
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. We recommend setting the `CLERK_API_VERSION` environment variable and using this instead.
