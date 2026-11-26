---
'@clerk/mosaic': patch
---

The verification code field in `UserProfile` is calmer to type into: digits fade in, one focus ring glides between the boxes, and a six-digit code reads as two groups of three. A rejected code gives the row a small nudge, and a verified code outlines every box in the text color instead of green. The code step no longer repeats “Verification code” above the boxes; screen readers still announce it. Code boxes are now 48px squares in every dialog and card, where some were 56px tall and stretched to fill the row.
