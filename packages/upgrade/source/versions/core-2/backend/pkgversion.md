---
title: '`pkgVersion` -> `clerkJSVersion`'
matcher:
  - "loadInterstitialFromLocal\\([\\s\\S]*?pkgVersion:[\\s\\S]*?\\)"
  - "loadInterstitialFromBAPI\\([\\s\\S]*?pkgVersion:[\\s\\S]*?\\)"
  - "buildPublicInterstitialUrl\\([\\s\\S]*?pkgVersion:[\\s\\S]*?\\)"
matcherFlags: 'm'
---

The `pkgVersion` parameter was removed from the `loadInterstitialFromLocal`, `loadInterstitialFromBAPI`, and `buildPublicInterstitialUrl` functions. Use `clerkJSVersion` instead. Example:

```diff
- loadInterstitialFromLocal({ pkgVersion: "..." })
+ loadInterstitialFromLocal({ clerkJSVersion: "..." })
```
