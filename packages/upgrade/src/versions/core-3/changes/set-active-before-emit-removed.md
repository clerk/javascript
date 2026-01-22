---
title: '`setSelected({ beforeEmit })` changed to `setSelected({ navigate })`'
matcher: 'beforeEmit'
category: 'deprecation-removal'
---

The `beforeEmit` callback in `setSelected()` (formerly `setActive()`) has been replaced with `navigate`. The callback signature has also changed:

```diff
await setSelected({
  session: sessionId,
- beforeEmit: () => {
-   // Called before session is set
- }
+ navigate: ({ session }) => {
+   // Called with the session object
+   return '/dashboard';
+ }
});
```

The `navigate` callback receives an object with the `session` property and should return the URL to navigate to.
