---
'@clerk/ui': patch
---

Add a "Back" action to the authenticator-app verification step in `<UserProfile />`, so a user who needs to re-scan can return to the QR code instead of cancelling the whole setup. Going back now reuses the TOTP secret already issued rather than generating a new one, keeping any code the user has already scanned valid.
