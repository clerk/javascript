---
'@clerk/backend': patch
---

Update the `allowedOrigins` JSDoc on `clerkClient.instances.update()` and the `Instance` resource to note that Electron apps using `@clerk/electron` also need the renderer's dev server origin, for example `http://localhost:5173`, during development.
