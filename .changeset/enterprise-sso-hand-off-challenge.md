---
'@clerk/clerk-js': patch
'@clerk/ui': patch
---

Fix enterprise SSO sign-ins erroring, or appearing to do nothing, instead of showing a verification challenge raised while handing off to the identity provider. This covers the card for choosing between multiple enterprise connections, where clicking a connection left the user on an unchanged card.
