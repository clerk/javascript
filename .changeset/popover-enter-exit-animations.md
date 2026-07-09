---
'@clerk/ui': patch
---

The `<OrganizationSwitcher />` and `<UserButton />` popovers now open and close with an origin-aware scale-and-fade animation that grows from the edge nearest the trigger. Motion is disabled when `appearance.animations` is `false` or the user prefers reduced motion.
