---
title: '`useAuth().getToken` is no longer `undefined` during SSR'
matcher: 'getToken'
category: 'breaking'
---

`useAuth().getToken` is no longer `undefined` during server-side rendering. It is now a function that throws a `clerk_runtime_not_browser` error when called on the server.

If you were checking `getToken === undefined` to avoid calling it during SSR, update your code to catch the error instead:

```diff
- if (getToken) {
-   const token = await getToken();
- }
+ try {
+   const token = await getToken();
+ } catch (error) {
+   if (isClerkRuntimeError(error) && error.code === 'clerk_runtime_not_browser') {
+     // Handle server-side scenario
+   }
+ }
```

### Who is affected

- If you only use `getToken` in `useEffect`, event handlers, or with non-suspenseful data fetching libraries, **no change is necessary** as these only run on the client.
- If you were using `getToken === undefined` checks to avoid calling it during SSR, update to use try-catch error handling.

### Server-side auth

To access auth data server-side, use the [`Auth` object](https://clerk.com/docs/reference/backend/types/auth-object) provided by your SDK instead of `useAuth()`.
