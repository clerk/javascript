---
'@clerk/upgrade': patch
---

Stop before changing any packages when the project's Next.js or Expo version is below what the new SDK supports. Previously the upgrade failed with the package manager's peer dependency error (npm) or installed an incompatible SDK (pnpm), and no codemods ran.
