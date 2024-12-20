---
"@clerk/nuxt": patch
---

Fix Vite optimization issue that caused duplicate versions of @clerk/vue to be created on first load, resulting in the Vue plugin losing context.
