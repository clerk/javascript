---
title: '`clerkJSUrl`, `clerkJSVersion`, `clerkUIUrl`, and `clerkUIVersion` props removed'
matcher:
  - 'clerkJSUrl'
  - 'clerkJSVersion'
  - 'clerkUIUrl'
  - 'clerkUIVersion'
category: 'deprecation-removal'
---

The `clerkJSUrl`, `clerkJSVersion`, `clerkUIUrl`, and `clerkUIVersion` props have been removed from `ClerkProvider` and related configuration options. These props were intended for internal use and are no longer part of the public API.

If you are using these props, prefix them with `__internal_` to continue using them. Note that these are internal APIs and may change without notice.

A codemod is available to automatically apply this change:

```diff
<ClerkProvider
- clerkJSUrl="https://js.example.com/clerk.js"
- clerkJSVersion="5.0.0"
- clerkUIUrl="https://ui.example.com/ui.js"
- clerkUIVersion="1.0.0"
+ __internal_clerkJSUrl="https://js.example.com/clerk.js"
+ __internal_clerkJSVersion="5.0.0"
+ __internal_clerkUIUrl="https://ui.example.com/ui.js"
+ __internal_clerkUIVersion="1.0.0"
>
```
