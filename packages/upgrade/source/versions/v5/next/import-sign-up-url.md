---
title: '`SIGN_UP_URL` constant removed'
matcher: "SIGN_UP_URL[\\s\\S]*?from\\s+['\"]@clerk\\/nextjs[\\s\\S]*?['\"]"
---

This deprecated constant has been removed as an export from `@clerk/nextjs`. We recommend setting the `NEXT_PUBLIC_CLERK_SIGN_UP_URL` environment variable and using this instead.
