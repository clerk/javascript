---
'@clerk/expo': patch
---

Load `expo-auth-session` and `expo-web-browser` in `useSSO` via synchronous `require()` instead of dynamic `import()`, which fails to resolve under Metro when `@expo/metro-runtime` is not set up at the app entry.
