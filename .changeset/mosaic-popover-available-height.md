---
'@clerk/mosaic': patch
---

Fix `Popover` content running off-screen on mobile when the on-screen keyboard opens. Popovers now cap their height to the visible space next to the trigger, which keeps the focused country search in `PhoneInput` in view.
