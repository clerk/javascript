---
title: '`frontendApi` -> `publishableKey` as prop to `ClerkProvider`'
matcher: "<ClerkProvider[\\s\\S]*?frontendApi=[\\s\\S]*?>"
category: 'deprecation-removal'
matcherFlags: 'm'
---

The `frontendApi` prop passed to `<ClerkProvider>` was renamed to `publishableKey`. **Note:** The values are different, so this is not just a key replacement. You can visit your [Clerk dashboard](https://dashboard.clerk.com/last-active?path=api-keys) to copy/paste the new keys after choosing your framework. Make sure to update this in all environments (e.g. dev, staging, production). [More information](/docs/deployments/overview#api-keys-and-environment-variables).
