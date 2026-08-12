---
'@clerk/ui': patch
---

Mosaic `Card` corners now keep their authored roundness while a popover opens and closes. The popup scales on enter and exit, which scaled the rendered radius of the card inside it along with it, so the corners visibly flattened and re-rounded across the transition.
