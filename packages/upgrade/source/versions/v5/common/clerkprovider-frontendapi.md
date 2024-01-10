---
title: '`frontendApi` -> `publishableKey` as prop to `ClerkProvider`'
matcher: "<ClerkProvider[\\s\\S]*?frontendApi=[\\s\\S]*?>"
matcherFlags: 'm'
---

The `frontendApi` prop passed to `<ClerkProvider>` was renamed to `publishableKey`. **Note:** The values are different, so this is not just a key replacement. You can find the publishable key in your Clerk dashboard. Make sure to update this in all environments (dev, staging, production). [More information](/docs/deployments/overview#api-keys-and-environment-variables).
