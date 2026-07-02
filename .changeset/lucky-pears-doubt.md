---
'@clerk/shared': patch
'@clerk/ui': patch
---

On the Test step of the self-serve SSO configuration flow, clicking Continue now re-checks for a successful test run before blocking, so a successful run completed in a separate browser tab is recognized without first clicking Refresh logs.
