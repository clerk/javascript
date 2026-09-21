---
'@clerk/mosaic': patch
---

`@floating-ui/react` is now installed as a dependency of `@clerk/mosaic` instead of being bundled into its output, so apps that already use it can share a single copy.
