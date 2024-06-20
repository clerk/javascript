---
title: '`API_URL` value has changed'
matcher: "import\\s+{[^}]*?[,\\s]API_URL[,\\s][\\s\\S]*?from\\s+['\"]@clerk\\/clerk-sdk-node[\\s\\S]*?['\"]"
matcherFlags: 'm'
warning: true
---

The value of this export has changed from `https://api.clerk.dev` to `https://api.clerk.com`. If you were relying on the text content of this value not changing, you may need to make adjustments.
