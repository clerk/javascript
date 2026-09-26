---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Route an OAuth callback to the enterprise connection chooser when the returned email matches more than one enterprise connection, instead of the sign-in start page or the sign-up continue page.
