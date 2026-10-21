---
'@clerk/ui': minor
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/localizations': patch
---

Offer enterprise SSO as a first factor in the reverification modal. Users with an `enterprise_sso` factor now get a button per enterprise connection, verify with their identity provider in a popup, and the action that asked for reverification resumes without a page reload. When the popup is blocked the modal falls back to a full-page redirect. `session.prepareFirstFactorVerification` accepts `actionCompleteRedirectUrl` for the `enterprise_sso` strategy.
