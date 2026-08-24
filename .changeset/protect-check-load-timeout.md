---
'@clerk/clerk-js': patch
'@clerk/react': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Fix an issue where a verification that was still progressing normally could be cancelled and reported to the user as having timed out.
