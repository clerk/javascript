---
'@clerk/clerk-js': patch
'@clerk/types': patch
'@clerk/clerk-expo': patch
---

Improve the UX on Reverification by not requiring the user's current password. 

The user has already verified themselves using Reverification, so there is no point to maintain a two level verification in case they would like to change their password. Also, Reverification is a stronger verification factor, as it includes strategies such as email code.
