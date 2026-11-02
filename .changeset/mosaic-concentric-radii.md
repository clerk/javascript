---
'@clerk/mosaic': patch
---

Align the corners of `Select`, `Combobox`, `Menu` and `PhoneInput` options and `ActionBar` buttons with their surrounding surface. These radii now follow `--cl-radius-lg` and `--cl-spacing` rather than `--cl-radius-md`, so an override of `--cl-radius-md` no longer changes them.
