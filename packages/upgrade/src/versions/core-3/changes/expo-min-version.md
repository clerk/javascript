---
title: 'Minimum Expo version increased to 53'
packages: ['expo']
matcher: "expo\":\\s*\"(?:^|~|>|=|\\s)*(?:50|51|52)\\..*?"
matcherFlags: 'm'
category: 'version'
---

Support for Expo 50, 51, and 52 has been dropped. Update your project to Expo 53 or later:

```diff
{
  "dependencies": {
-   "expo": "~52.0.0",
+   "expo": "~53.0.0",
  }
}
```

Run the Expo upgrade command:

```bash
npx expo install expo@latest
```
