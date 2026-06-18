---
"@clerk/shared": patch
---

Add an `inertProps` helper (`@clerk/shared/inert`) that resolves the correct `inert` attribute value for the consumer's React major (React 19 dropped the `inert` attribute for falsy string values).
