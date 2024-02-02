---
title: '`PROXY_URL` constant removed'
matcher: "import\\s+{[\\s\\S]*?PROXY_URL[\\s\\S]*?from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
category: 'deprecation-removal'
matcherFlags: 'm'
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. We recommend setting the `NEXT_PUBLIC_CLERK_PROXY_URL` environment variable and using this instead.
