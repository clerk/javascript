---
title: '`CLERK_JS_VERSION` constant removed'
matcher: "import\\s+{[^}]*?CLERK_JS_VERSION[\\s\\S]*?from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
category: 'deprecation-removal'
matcherFlags: 'm'
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. Instead, set and use the `NEXT_PUBLIC_CLERK_JS_VERSION` environment variable.
