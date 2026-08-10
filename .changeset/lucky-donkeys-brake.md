---
'@clerk/clerk-js': patch
---

Keep the freshest session token when a server response carries an older one. A slow response, or the client payload attached to one, could previously roll `lastActiveToken` back to a stale token, which is the token sent as the previous-token hint on the next token request.
