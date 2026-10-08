---
'@clerk/ui': patch
---

Require fresh confirmation when a reset or removal dialog changes its target. Prevent duplicate reset requests and discard late errors or close callbacks after the dialog closes.
