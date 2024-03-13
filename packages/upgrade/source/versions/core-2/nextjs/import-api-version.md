---
title: '`API_VERSION` constant removed'
matcher: "import\\s+{[^}]*?API_VERSION[\\s\\S]*?from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
category: 'deprecation-removal'
matcherFlags: 'm'
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. Instead, set and use the `CLERK_API_VERSION` environment variable.
