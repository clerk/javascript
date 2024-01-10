---
title: '`CLERK_FRONTEND_API` replaced by `CLERK_PUBLISHABLE_KEY`'
matcher: '[^_]CLERK_FRONTEND_API'
---

The `CLERK_FRONTEND_API` environment variable was renamed to `CLERK_PUBLISHABLE_KEY`. **Note:** The values are different, so this is not just a key replacement. You can find the publishable key in your Clerk dashboard. Make sure to update this in all environments (dev, staging, production). [More information](/docs/deployments/overview#api-keys-and-environment-variables).
