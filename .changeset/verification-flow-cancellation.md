---
'@clerk/clerk-js': patch
'@clerk/shared': patch
---

Email-link and enterprise SSO verification flows now stop polling when cancelled during preparation and ignore results from cancelled polling requests. Polling also releases its timer worker when stopped before the first timer is scheduled.
