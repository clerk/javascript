---
title: '`CLERK_FRONTEND_API` replaced by `CLERK_PUBLISHABLE_KEY`'
category: 'deprecation-removal'
matcher: 'CLERK_FRONTEND_API'
---

The `CLERK_FRONTEND_API` environment variable was renamed to `CLERK_PUBLISHABLE_KEY`. You can visit your [Clerk dashboard](https://dashboard.clerk.com/last-active?path=api-keys) to copy/paste the new keys after choosing your framework. Make sure to update this in all environments (e.g. dev, staging, production). **Note:** The values are different, so this is not just a key replacement. [More information](/docs/deployments/overview#api-keys-and-environment-variables).
