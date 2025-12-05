---
title: '`setActive({ beforeEmit })` changed to `setActive({ navigate })`'
matcher: 'beforeEmit'
category: 'deprecation-removal'
---

The `beforeEmit` callback in `setActive()` has been replaced with `navigate`. The callback signature has also changed:

```diff
await setActive({
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
