---
'@clerk/clerk-react': patch
---

Initialize isomorphic clerk with `useRef`. Avoid memoizing the singleton, instead use a reference to store it, and then destroy it.
