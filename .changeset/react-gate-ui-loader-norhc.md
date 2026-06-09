---
'@clerk/react': patch
---

Gate the remote Clerk UI script loader behind `__BUILD_DISABLE_RHC__` so no-remote-code builds (such as `@clerk/chrome-extension`) dead-code-eliminate the `ui.browser.js` CDN loader, matching the existing behavior for the clerk-js loader. Standard browser apps are unaffected and continue to hotload Clerk UI from the CDN.
