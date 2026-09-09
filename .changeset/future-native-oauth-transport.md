---
'@clerk/clerk-js': patch
---

Support injected OAuth transports in future-style sign-in and sign-up SSO flows. The configured callback is reconciled before the operation completes, while session finalization remains explicit. Ignore callbacks for attempts that were replaced while browser authentication was in progress.
