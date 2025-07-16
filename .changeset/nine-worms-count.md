---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

- Render parsed `colorRing` at 15% vs 100%
- Render parsed `colorModalBackdrop` at 73% vs 100%
- Ensure `avatarBackground` and `avatarBorder` render with parsed neutral colors when `colorNeutral` is passed in via variables prop
