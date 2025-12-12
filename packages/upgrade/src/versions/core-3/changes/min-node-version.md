---
title: 'Upgrade Node.js to v20.9.0 or higher'
category: 'version'
matcher: "engines\":\\s*{[\\s\\S]*?\"node\":\\s*\"(?:^|~|>|=|\\s)*(?:14|16|18)\\..*?"
matcherFlags: 'm'
---

All Clerk packages now require Node.js 20.9.0 or later. Update your Node.js version and ensure your `package.json` engines field reflects this requirement.

```diff
{
  "engines": {
-   "node": ">=18.0.0"
+   "node": ">=20.9.0"
  }
}
```
