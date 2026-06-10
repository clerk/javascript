---
"@clerk/ui": patch
---

Fix `inert` attribute to work correctly in React 19. The previous value `''` (empty string) is falsy and not set by React 19's boolean attribute handler, leaving hidden panel and collapsible content interactive. Switches to `'true'` which is truthy in both React 18 and 19.
