---
'@clerk/clerk-js': patch
---

Compute the proactive session-token refresh from the token's absolute expiry. A token restored from the session cookie on page load (issued before the tab opened) now schedules its background refresh ahead of expiry instead of after it, where previously the refresh could be scheduled past expiration and never fire proactively.
