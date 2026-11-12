---
'@clerk/nuxt': patch
---

Fix the `[NUXT_B7002] Some vite.optimizeDeps.include entries could not be resolved: @clerk/vue` warning on dev server start with package managers that do not hoist transitive dependencies, such as pnpm and Bun. In these setups on Nuxt versions before 4.6, Vite now pre-bundles `@clerk/vue` instead of serving its modules unbundled in development.
