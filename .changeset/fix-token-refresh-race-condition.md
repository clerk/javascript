---
"@clerk/clerk-js": patch
---

Fix race condition where multiple browser tabs could fetch session tokens simultaneously. The `refreshTokenOnFocus` handler now uses the same cross-tab lock as the session token poller, preventing duplicate API calls when switching between tabs or when focus events fire while another tab is already refreshing the token.

