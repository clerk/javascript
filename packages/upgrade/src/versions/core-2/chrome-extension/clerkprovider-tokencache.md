---
title: '`tokenCache` -> `storageCache` as `<ClerkProvider>` props'
matcher: "<ClerkProvider[\\s\\S]*?tokenCache=[\\s\\S]*?>"
matcherFlags: 'm'
category: 'skip'
---

The `tokenCache` prop has been renamed to `storageCache` in order to accommodate the new [WebSSO feature](https://github.com/clerk/javascript/pull/2277). With the prop change from `tokenCache` to `storageCache`, the interface has been expanded to allow for more flexibility. The new interface is as follows:

```ts
type StorageCache = {
  createKey: (...keys: string[]) => string;
  get: <T = any>(key: string) => Promise<T>;
  remove: (key: string) => Promise<void>;
  set: (key: string, value: string) => Promise<void>;
};
```

And here's a full before/after example:

```diff
- <ClerkProvider tokenCache={/* ... */}>
+ <ClerkProvider storageCache={/* ... */}>
```
