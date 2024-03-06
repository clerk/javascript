---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Experimental support for reading, updating, and deleting a user's registered passkeys.
- Get the user's passkeys
  `clerk.user.__experimental__passkeys`
- Update the name of a passkey
  `clerk.user.__experimental__passkeys?.[0].update({name:'work laptop passkey'})`
- Delete a passkey
  `clerk.user.__experimental__passkeys?.[0].delete()`
