---
'@clerk/ui': minor
---

Improve RTL support by converting physical CSS properties (margins, padding, text alignment, borders) to logical equivalents and adding direction-aware arrow icons

The changes included:

- Positioning (left → insetInlineStart)
- Margins (marginLeft/Right → marginInlineStart/End)
- Padding (paddingLeft/Right → paddingInlineStart/End)
- Text alignment (left/right → start/end)
- Border radius (borderTopLeftRadius → borderStartStartRadius)
- Arrow icon flipping with scaleX(-1) in RTL
- Animation direction adjustments
