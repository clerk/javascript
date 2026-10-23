---
'@clerk/ui': patch
---

Fix the impersonation button moving faster than the pointer when dragged. It now starts dragging only after the pointer moves a few pixels, prevents page text selection during dragging, and springs back inside the window when released off-screen instead of jumping to its default position. Its background now follows the theme, so its text is readable in dark mode.
