---
title: '`CLERK_FRONTEND_API` replaced by `CLERK_PUBLISHABLE_KEY`'
category: 'deprecation-removal'
matcher: 'CLERK_FRONTEND_API'
---

If you are using a `CLERK_FRONTEND_API` environment variable, the name must be changed to `CLERK_PUBLISHABLE_KEY` instead. Note that the values are different as well, so this is not just a key replacement. You can find the publishable key in your Clerk dashboard. Make sure you do this in both your dev and production environments.
