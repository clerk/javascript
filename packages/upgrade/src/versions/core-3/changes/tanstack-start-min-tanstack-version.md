---
title: 'Minimum TanStack Start version increased'
packages: ['tanstack-react-start']
matcher: "@tanstack/react-start\":\\s*\"(?:^|~|>|=|\\s)*(?:1\\.1(?:[0-4]\\d|5[0-6]))\\..*?"
matcherFlags: 'm'
category: 'version'
warning: true
---

`@clerk/tanstack-react-start` v1 requires `@tanstack/react-start` v1.157.0 or later (along with matching versions of `@tanstack/react-router` and `@tanstack/react-router-devtools`).

If you pin TanStack versions, update them:

```diff
{
  "dependencies": {
-   "@tanstack/react-router": "1.154.14",
-   "@tanstack/react-router-devtools": "1.154.14",
-   "@tanstack/react-start": "1.154.14",
+   "@tanstack/react-router": "1.160.2",
+   "@tanstack/react-router-devtools": "1.160.2",
+   "@tanstack/react-start": "1.160.2",
  }
}
```
