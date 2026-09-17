---
'@clerk/mosaic': patch
---

Tighten the gap between a `Card` header's title and description from `4px` to `2px`. This applies to every card and card dialog, including the ones `UserButton` renders.

`styles.css` also grows rules for the new internal `DataList` component and the user profile's active device dialogs. Neither is exported yet, so nothing else changes for consumers.
