---
'@clerk/mosaic': patch
---

Moving the highlight in `Combobox`, `Autocomplete`, `Select` and the `PhoneInput` country list with the arrow keys or the pointer is faster, because only the previously and newly highlighted options update instead of the whole list. Selecting an option in a multiple `Select` updates only the options whose selection changed.
