---
'@clerk/ui': minor
---

Add the `UserButton` Mosaic component: an account and organization switcher that combines multi-session account switching with organization selection, suggestions, and invitations behind a single popover. Exposes the all-in-one `UserButton` plus the composable `UserButtonRoot`, `UserButtonTrigger`, and `UserButtonPopup` parts. It owns no slots of its own: it is composed from `Popover`, `Card`, `Item`, `Avatar` and `Menu`, so `appearance.elements` overrides for those components theme it too.
