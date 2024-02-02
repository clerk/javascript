---
title: '`CLERK_API_KEY` replaced by `CLERK_SECRET_KEY`'
category: 'deprecation-removal'
matcher: 'CLERK_API_KEY'
---

The `CLERK_API_KEY` environment variable was renamed to `CLERK_SECRET_KEY`. You can visit your [Clerk dashboard](https://dashboard.clerk.com/last-active?path=api-keys) to copy/paste the new keys after choosing your framework. Make sure to update this in all environments (e.g. dev, staging, production).
