---
'@clerk/localizations': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

`<SignIn />` and `<SignUp />` now show a dedicated screen when a request is blocked, in place of the inline error. It shows a reference the user can quote to support and, when the application has configured them, its own title, description and help link.

For custom flows, an `action_blocked` error's `meta` now exposes `traceId`, `title`, `description`, `linkUrl`, `linkText`, `kind` and `data`.

Adds the `actionBlocked` localization keys and the `actionBlockedIconBox`, `actionBlockedIcon`, `actionBlockedLink`, `actionBlockedTraceIdBox`, `actionBlockedTraceIdLabel` and `actionBlockedTraceId` appearance elements.
