---
'@clerk/ui': patch
---

The `<OrganizationSwitcher />` and `<UserButton />` popovers now open instantly and fade out on close, replacing the previous slide-and-scale entrance animation. Motion is disabled when `appearance.animations` is `false` or the user prefers reduced motion.
