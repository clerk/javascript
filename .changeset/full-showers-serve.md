---
'@clerk/clerk-react': patch
---

Ensure that useAuth() hook returns isLoaded=false when isomorphicClerk is loaded but we are in transitive state
