---
'@clerk/react-router': minor
---

Add support for React Router v8.

If you're using React Router v7, keep the `v8_middleware` future flag enabled. If you're migrating to React Router v8, remove the flag:

```diff
// react-router.config.ts
export default {
- future: {
-   v8_middleware: true,
- },
}
```
