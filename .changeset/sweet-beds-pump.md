---
'@clerk/clerk-expo': minor
---

This removes headers that were added for internal observability purposes. (see #2528)

```diff
- x-expo-execution-environment
- x-expo-native-application-version
```

This aims to resolve reported CORS errors. (see #2266)

This removes `expo-application` & `expo-constants` as peer and development dependencies.
