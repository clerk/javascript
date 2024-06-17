---
title: '`GASTBY_CLERK_FRONTEND_API` replaced by `GATSBY_CLERK_PUBLISHABLE_KEY`'
category: 'deprecation-removal'
matcher: 'GATSBY_CLERK_FRONTEND_API'
---

If you are using a `GATSBY_CLERK_FRONTEND_API` environment variable, the name must be changed to `GATSBY_CLERK_PUBLISHABLE_KEY` instead. Note that the values are different as well, so this is not just a key replacement. You can find the publishable key in your Clerk dashboard. Make sure you do this in both your dev and production environments.
