---
'@clerk/expo': patch
---

Fix session loss on Expo JS reload (pressing R in dev)

`NativeSessionSync` was calling native `signOut()` during the loading phase when `isSignedIn` is `undefined`. On a JS reload, the native module persists from the previous session, so `signOut()` revokes the session server-side and clears all keychain items, forcing the user to log in again. This adds an `isLoaded` guard so native `signOut()` is only called when Clerk has confirmed the user is actually signed out.
