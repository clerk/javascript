---
'@clerk/expo': patch
---

Clear JWT from SecureStore when signing out via native components (AuthView, UserButton) to prevent "session_exists" / "already signed in" errors on subsequent sign-in attempts.
