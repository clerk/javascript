---
'@clerk/shared': patch
---

Deprecate `createPathMatcher()` and its pattern types (`PathMatcherParam`, `PathPattern`, `WithPathSegmentWildcard`). Pattern-based path matching is being phased out along with the framework-level `createRouteMatcher()` helpers and will be removed in the next major version. Use your framework's native routing primitives to decide which paths to protect instead.
