---
'@clerk/nextjs': patch
---

Enforce middleware authorization during the keyless bootstrap window. `auth.protect()` and custom authorization checks now fail closed instead of being bypassed while the publishable key is being provisioned.
