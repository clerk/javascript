---
'@clerk/shared': minor
'@clerk/clerk-js': minor
'@clerk/ui': minor
'@clerk/localizations': minor
---

Introduce the `setup-enterprise-sso` session task. When an organization requires its members to authenticate through its enterprise SSO connection, `<SignIn />` and `<SignUp />` now show a step that sends the user through that connection before the organization can be used. Switching to such an organization with `setActive` also routes to the task instead of leaving the session pending with nothing on screen.
