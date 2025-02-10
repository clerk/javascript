---
title: '`SECRET_KEY` constant removed'
matcher: "import\\s+{[^}]*?SECRET_KEY[\\s\\S]*?from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
category: 'deprecation-removal'
matcherFlags: 'm'
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. Instead, set and use the `CLERK_SECRET_KEY` environment variable.
