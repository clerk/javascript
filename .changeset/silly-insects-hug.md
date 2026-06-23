---
'@clerk/clerk-js': patch
'@clerk/ui': patch
---

Self-serve SSO: fix the configuration wizard rendering a blank step when a connection is reset from the first configuration step. Resetting now returns to the provider selection step.
