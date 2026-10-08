---
'@clerk/ui': patch
---

Fix `<SignUp />` asking a returning user to fill in missing fields after a verification challenge. When someone signs up with a social account that already belongs to a user, they are now signed in to that account once the challenge clears, as they are when no challenge is shown.
