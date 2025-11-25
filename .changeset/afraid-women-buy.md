---
'@clerk/clerk-js': patch
---

Prevent enable organization prompt from appearing if there is a session with a pending `choose-organization` task.

This resolves an issue where, after organizations are enabled via the Dashboard, cached environment resources may cause the prompt to show again when the user is redirected to complete the `choose-organization` task.
