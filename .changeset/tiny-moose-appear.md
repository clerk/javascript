---
'@clerk/upgrade': patch
---

Remove an internal function that was executed but its return value wasn't used. In some instances this function threw an error.
