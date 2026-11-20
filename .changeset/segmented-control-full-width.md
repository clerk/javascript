---
'@clerk/mosaic': patch
---

`SegmentedControl.Root` now keeps its natural width inside flex and grid containers instead of stretching to fill them. Pass the new `fullWidth` prop to fill the container, with the items sharing the width evenly.
