---
'@clerk/clerk-js': patch
---

Only refresh signIn and signUp resources during an SSO callback if the authentication was performed via a popup.
