---
title: '`auth.protect()` returns 401 instead of 404 for unauthenticated server actions'
packages: ['nextjs']
matcher: 'auth\.protect\('
matcherFlags: 'm'
category: 'breaking'
---

`auth.protect()` in `clerkMiddleware()` now returns a `401 Unauthorized` response instead of a `404 Not Found` when an unauthenticated request is made from a server action.

Previously, unauthenticated server action requests would receive a `404` response, which made it difficult for client-side code to distinguish between "not found" and "not authenticated." The new behavior returns `401`, which is the semantically correct HTTP status code for unauthenticated requests.

### Who is affected

If your application uses `auth.protect()` inside `clerkMiddleware()` and you have server actions that may be called by unauthenticated users, the HTTP status code returned will change from `404` to `401`.

### What to do

If you have client-side error handling that checks for `404` responses from server actions when the user is signed out, update it to handle `401` instead:

```diff
try {
  await myServerAction();
} catch (error) {
-  if (error.status === 404) {
+  if (error.status === 401) {
    // Handle unauthenticated user
  }
}
```

No changes are required if you are not explicitly checking the HTTP status code in your error handling.
