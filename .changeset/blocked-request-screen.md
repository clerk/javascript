---
'@clerk/localizations': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

`<SignIn />` and `<SignUp />` show a dedicated screen when a request is blocked, with a reference the user can quote to support.

`action_blocked` errors now expose `traceId`, `title`, `description`, `linkUrl`, `linkText`, `kind` and `data` on `meta`.
