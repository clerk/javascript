---
'@clerk/backend': minor
---

Add `clerkClient.users.getUserListWithoutCount()`, which takes the same parameters as `getUserList()` and returns `{ data }` with the same page of users, without the request to count them. Use it when you don't need `totalCount`: counting can be slow for a search over many users, and `getUserList()` fails when the count does and the page is full.
