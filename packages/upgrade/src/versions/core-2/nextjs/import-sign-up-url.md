---
title: '`SIGN_UP_URL` constant removed'
matcher: "import\\s+{[^}]*?SIGN_UP_URL[\\s\\S]*?from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
category: 'deprecation-removal'
matcherFlags: 'm'
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. Instead, set and use the `NEXT_PUBLIC_CLERK_SIGN_UP_URL` environment variable.
