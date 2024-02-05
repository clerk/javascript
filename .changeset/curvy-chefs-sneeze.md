---
'@clerk/backend': major
---

Make all listing API requests to return consistent `{ data: Resource[], totalCount: number }`.

Support pagination request params `{ limit, offset }` to:
- `sessions.getSessionList({ limit, offset })`
- `clients.getClientList({ limit, offset })`

Since the `users.getUserList()` does not return the `total_count` as a temporary solution that
method will perform 2 BAPI requests:
1. retrieve the data
2. retrieve the total count (invokes `users.getCount()` internally)
