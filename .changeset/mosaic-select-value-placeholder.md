---
'@clerk/mosaic': patch
---

Show the `placeholder` on `Select.Value` while nothing is selected, even when it has a function child. Previously the function was called with an empty array, rendering text like "0 organizations" instead of the placeholder.
