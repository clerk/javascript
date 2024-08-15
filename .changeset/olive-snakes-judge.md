---
"@clerk/clerk-expo": minor
---

Change the export of `useLocalCredentials` hook from `@clerk/clerk-expo` to `@clerk/clerk-expo/local-credentials`.

In `@clerk/clerk-expo@2.1.0` a new hook called `useLocalCredentials` was introduced ([PR 3663](https://github.com/clerk/javascript/pull/3663)). This hook is optional, but Expo's bundler has problems tree-shaking this codepath so users were still required to install its peer dependencies even if they didn't use that hook.

For this **breaking** change, update your import as following:

```diff
- import {  useLocalCredentials } from "@clerk/clerk-expo"
+ import { useLocalCredentials } from "@clerk/clerk-expo/local-credentials"
```
