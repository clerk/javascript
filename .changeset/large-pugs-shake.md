---
'@clerk/testing': patch
---

When a Frontend API request exhausts its retries in the Playwright `setupClerkTestingToken` helper, the warning now includes response diagnostics (`cf-ray`, `retry-after`, `content-type`, and a truncated response body) so rate-limit responses can be attributed to their source. Network-error retry exhaustion now includes the error message in the warning as well.
