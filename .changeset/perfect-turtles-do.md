---
'@clerk/clerk-react': patch
---

ClerkContextProvider uses React.startTransition for state updates fixing hydration issues for SSR
