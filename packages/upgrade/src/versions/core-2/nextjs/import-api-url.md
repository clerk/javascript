---
title: '`API_URL` constant removed'
matcher: "import\\s+{[^}]*?API_URL[\\s\\S]*?from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
category: 'deprecation-removal'
matcherFlags: 'm'
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. Instead, set and use the `CLERK_API_URL` environment variable.
