---
title: '`CLERK_API_KEY` replaced by `CLERK_SECRET_KEY`'
matcher: '[^_]CLERK_API_KEY'
---

If you are using a `CLERK_API_KEY` environment variable, the name must be changed to `CLERK_SECRET_KEY` instead. Make sure you do this in both your dev and production environments.
