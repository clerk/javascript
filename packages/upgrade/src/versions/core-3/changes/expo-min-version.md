---
title: 'Minimum Expo version increased to 54'
packages: ['expo']
matcher: "expo\":\\s*\"(?:^|~|>|=|\\s)*(?:50|51|52|53)\\..*?"
matcherFlags: 'm'
category: 'version'
---

Support for Expo 50, 51, 52, and 53 has been dropped. Update your project to Expo 54 or later:

```diff
{
  "dependencies": {
-   "expo": "~53.0.0",
+   "expo": "~54.0.0",
  }
}
```

Run the Expo upgrade command:

```bash
npx expo install expo@latest
```
