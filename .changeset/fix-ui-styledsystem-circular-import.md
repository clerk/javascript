---
'@clerk/ui': patch
---

Fix a circular import in the styled-system that could crash module initialization under bundler configurations with tree-shaking disabled.
