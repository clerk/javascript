---
'@clerk/mosaic': patch
---

Fix the gap around the badge on the UserButton avatar breaking when the avatar or its badge is resized. `.cl-user-button-avatar` now reads `--cl-avatar-badge-size`, `--cl-avatar-badge-gap` and `--cl-avatar-badge-offset`, and the cutout behind the badge follows them.
