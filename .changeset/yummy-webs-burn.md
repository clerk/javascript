---
'@clerk/react': patch
---

Use shared `deriveState` in `useAuthBase` so SSR and client-side auth state are derived through the same entry point, keeping behavior consistent with other packages (Vue, Astro).
