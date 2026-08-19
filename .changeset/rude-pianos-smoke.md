---
'@clerk/electron': patch
'@clerk/ui': patch
---

Stop passkey autofill from opening a passkey prompt as soon as the sign-in form renders. Autofill now runs as a real background request when the window can service one (an `https` origin matching your RP ID), and is not attempted at all when it would route to the OS passkey dialog. Signing in with the explicit "Use passkey" action is unchanged.
