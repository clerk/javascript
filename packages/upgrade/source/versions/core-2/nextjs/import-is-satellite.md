---
title: '`IS_SATELLITE` constant removed'
matcher: "import\\s+{[^}]*?IS_SATELLITE[\\s\\S]*?from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
category: 'deprecation-removal'
matcherFlags: 'm'
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. Instead, set and use the `NEXT_PUBLIC_CLERK_IS_SATELLITE` environment variable.
