---
'@clerk/ui': patch
---

Stop `truncateWithEndVisible` from splitting characters outside the BMP (such as CJK Extension B kanji and emoji) into a broken replacement character when truncating to a very small width. The short-width fallback now slices by code point, matching the main truncation path.
