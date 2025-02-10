---
title: '`buildRequestUrl` import removed'
matcher: "import\\s+{[^}]*?buildRequestUrl[\\s\\S]*?}\\s+from\\s+['\"]@clerk\/backend['\"]"
matcherFlags: 'm'
---

The `buildRequestUrl` import was intended for those building custom Clerk integrations for frameworks and has been removed in favor of other methods internally. If you were relying on this function and this is an issue, please [reach out to Clerk support](https://clerk.com/support).
