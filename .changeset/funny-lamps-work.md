---
'@clerk/backend': minor
---

- Added the `User.last_active_at` timestamp field which stores the latest date of session activity, with day precision. For further details, please consult the [Backend API documentation](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUser).
- Added the `last_active_at_since` filtering parameter for the Users listing request. The new parameter can be used to retrieve users that have displayed session activity since the given date. For further details, please consult the [Backend API documentation](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUserList).
- Added the `last_active_at` available options for the `orderBy` parameter of the Users listing request. For further details, please consult the [Backend API documentation](https://clerk.com/docs/reference/backend-api/tag/Users#operation/GetUserList).
