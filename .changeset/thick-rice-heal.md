---
'@clerk/clerk-js': patch
---

Only go to enterprise connections chooser when there are multiple orgs
Before every sign-in with `enterprise_sso` strategy was going through
the enterprise accounts chooser, we only want to show it when there
are multiple enterprise connections available as `supported_first_factors`.
