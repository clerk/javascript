---
'@clerk/elements': patch
---

Refactors internal logic to avoid reliance on `useEffect`. This resolves potential for race conditions as a result of functionality coupled to component renders.
