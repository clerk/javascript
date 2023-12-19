---
'@clerk/clerk-js': major
---

Make the user name on <UserButton showName /> clickable, i.e. part of the button's trigger.
This change inverts the positions of `cl-userButtonTrigger` and `cl-userButtonBox`, the latter now being a child of the former.
