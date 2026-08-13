---
'@clerk/ui': patch
---

Mosaic `Dialog`s stacked on one another now share a single backdrop instead of each painting its own, so the page no longer darkens further with every level. The dialog beneath a stacked `prompt` recedes slightly to signal the layering. Only `prompt` dialogs are meant to stack; opening a `panel` or `card` inside another dialog now warns in development.
