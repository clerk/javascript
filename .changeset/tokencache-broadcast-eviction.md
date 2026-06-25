---
'@clerk/clerk-js': patch
---

Prevent a cross-tab broadcast failure from evicting a freshly cached session token. Previously, if broadcasting a token update to other tabs threw (for example when the `BroadcastChannel` was racing a close), the token that was just cached got dropped and the next `getToken()` made an unnecessary network request. The broadcast is now isolated so a failure no longer discards a valid cached token.
