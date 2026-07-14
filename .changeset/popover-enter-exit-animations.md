---
'@clerk/ui': patch
---

Popover-based surfaces now open and close with an origin-aware scale-and-fade that grows from the edge nearest the trigger, replacing the previous entrance-only slide animation. This covers the `<OrganizationSwitcher />` / `<UserButton />` menus, the overflow (⋯) menus, and selects — menus keep a quick-in / soft-out feel while selects use a quicker exit. Motion is disabled when `appearance.animations` is `false` or the user prefers reduced motion.
