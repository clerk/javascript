---
title: '`pkgVersion` -> `clerkJSVersion`'
matcher:
  - "loadInterstitialFromLocal\\([\\s\\S]*?pkgVersion:"
  - "loadInterstitialFromBAPI\\([\\s\\S]*?pkgVersion:"
  - "buildPublicInterstitialUrl\\([\\s\\S]*?pkgVersion:"
matcherFlags: 'm'
---

The `pkgVersion` parameter was removed from the `loadInterstitialFromLocal`, `loadInterstitialFromBAPI`, and `buildPublicInterstitialUrl` functions. Use `clerkJSVersion` instead. Example:

```diff
- loadInterstitialFromLocal({ pkgVersion: "..." })
+ loadInterstitialFromLocal({ clerkJSVersion: "..." })
```
