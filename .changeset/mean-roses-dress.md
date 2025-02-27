---
'@clerk/clerk-js': patch
---

Fix modal issues by inlining scroll locking mechanism instead of using `<FloatingOverlay/>` which caused issues in Chromium based browsers
