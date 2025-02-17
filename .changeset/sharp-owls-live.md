---
'@clerk/clerk-react': patch
---

Fix an infinity re-render issue in `UserProfileModal` when we pass `userProfileProps` in `<UserButton />` and we have `customMenuItems` and `customPages`
