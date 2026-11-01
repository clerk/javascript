---
"@clerk/mosaic": patch
"@clerk/shared": patch
---

Cancel pending UserProfile reverification when the active account changes, the user signs out, or the component unmounts. Delayed responses no longer reopen verification or retry the cancelled action for another account.
