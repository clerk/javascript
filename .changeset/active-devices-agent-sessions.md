---
'@clerk/ui': patch
---

Fix the Active devices list in `<UserProfile />` treating Agent Task sessions as impersonation. Agent sessions no longer show the "Other impersonator device" badge, and an agent viewing the list no longer sees a red "This device" badge or "User device" badges on the user's other devices.
