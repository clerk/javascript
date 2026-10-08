---
'@clerk/ui': patch
---

Prevent forms, avatar uploads, and organization selection task actions from starting overlapping requests on the same card before loading appears. Prevent older request cleanup from clearing an active request's loading state.
