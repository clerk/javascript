---
'@clerk/ui': minor
---

Mosaic `Button` no longer grows on touch devices to reach the recommended hit target. It keeps the size its `size` prop gives it and extends only the area that responds to a tap. Add `touchTarget={false}` to turn the larger tap area off where buttons sit close enough that theirs would overlap.
