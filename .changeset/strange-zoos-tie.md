---
'@clerk/clerk-js': patch
---

We are rolling back support for password complexity / strength checks during sign-in. Feature will be limited to HIBP for now. Hence, the password form need not expect a sign_in status of `needs_new_password`.
