---
'@clerk/shared': patch
'@clerk/clerk-js': patch
'@clerk/nextjs': patch
'@clerk/astro': patch
'@clerk/chrome-extension': patch
---

Rename dev browser APIs to remove JWT terminology. The dev browser identifier is now a generic ID, so internal naming has been updated to reflect this. No runtime behavior changes.
