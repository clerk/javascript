---
'@clerk/clerk-js': patch
---

When running in a browser context, session token requests now include a `tab_state` parameter (`focused`, `visible`, or `hidden`) so the backend can distinguish foreground from background token refreshes. The parameter is omitted in environments without a document, such as extension service workers.
