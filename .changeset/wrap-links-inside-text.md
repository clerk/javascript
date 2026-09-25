---
'@clerk/ui': patch
---

Allow the "Terms of Service" and "Privacy Policy" links in the sign-up legal consent label to wrap naturally across lines. They were previously styled `display: inline-flex`, which forced each link to wrap as a single unbreakable unit, leaving a gap at the end of the preceding line.
