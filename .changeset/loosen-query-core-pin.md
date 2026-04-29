---
'@clerk/shared': patch
'@clerk/clerk-js': patch
---

Loosen `@tanstack/query-core` dependency from an exact pin to a caret range (`^5.90.16`) so it can dedupe with consumer-installed `@tanstack/react-query` versions. This avoids Vite `resolve.dedupe` resolution failures under Bun when two divergent copies of `query-core` end up nested instead of hoisted.
