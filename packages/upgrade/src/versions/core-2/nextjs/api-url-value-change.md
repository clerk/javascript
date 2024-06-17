---
title: '`API_URL` value has changed'
matcher: "API_URL[\\s\\S]+?from\\s+['\"]@clerk\\/nextjs\\/server['\"]"
matcherFlags: 'm'
warning: true
---

The value of this export has changed from `https://api.clerk.dev` to `https://api.clerk.com`. If you were relying on the text content of this value not changing, you may need to make adjustments.
