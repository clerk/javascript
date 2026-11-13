---
'@clerk/backend': patch
---

`users.getUserList()` no longer waits for the user count when the page it lists already shows the total: a page with fewer users than its `limit`, or no users at all. The count can be slow for a search over many users, and before this change `getUserList()` failed whenever the count did. Both requests are still sent together, so a page that fills its `limit` takes as long as before.
