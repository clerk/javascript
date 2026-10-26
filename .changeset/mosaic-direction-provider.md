---
'@clerk/mosaic': patch
---

Add a `direction` prop to `MosaicProvider` (`'ltr' | 'rtl'`, default `'ltr'`). Arrow-key navigation in tabs, segmented controls, one-time code inputs, tag inputs, and nested menus now follows this prop instead of the nearest `dir` attribute. Pages that render right-to-left should pass `direction="rtl"`.
