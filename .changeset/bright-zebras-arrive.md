---
'@clerk/ui': major
---

Updates both `colorRing` and `colorModalBackdrop` to render at full opacity when modified via the appearance prop or CSS variables. Previously we'd render the provided color at 15% opacity, which made it difficult to dial in a specific ring or backdrop color.
