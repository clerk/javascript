---
'@clerk/ui': patch
---

Improve Menu keyboard navigation and accessibility. Menus now support `Enter`/`Space` to open from the trigger, `ArrowDown`/`ArrowUp`/`Home`/`End` to move focus, `Escape` to close and return focus to the trigger, and skip disabled items during arrow-key navigation. Menus no longer mark the rest of the page as `aria-hidden` while open, so assistive technologies can still reach surrounding content.
