---
'@clerk/ui': patch
---

Mosaic `Dialog` now distinguishes a stack — successive `prompt` dialogs, such as a confirmation over the form it is confirming — from a dialog opened over a `panel` or `card`. A stacked prompt paints no backdrop of its own, so the page no longer darkens further with every level; the prompt beneath it dims and recedes instead, and holds briefly when a stack is dismissed all at once so the exits are staggered. Dialogs opened over a `panel` or `card` are unchanged. Opening a `panel` or `card` inside another dialog now warns in development.
