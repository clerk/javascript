---
'@clerk/ui': patch
'@clerk/shared': patch
'@clerk/localizations': patch
---

Fix UserButton popover accessibility: use `role="dialog"` with grouped actions instead of `role="menu"` with `menuitem` children, fix focus management via floating-ui's interaction system, and add identity-first trigger labels
