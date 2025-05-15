---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Introduce `__experimental_startPath` option for `openOrganizationProfile`.

Example usage:

```ts
clerk.openOrganizationProfile({
  __experimental_startPath: '/billing',
});
```
