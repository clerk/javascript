---
'@clerk/shared': patch
---

Resolve the browser connectivity heuristics (`isValidBrowser`, `isBrowserOnline`, and therefore `isValidBrowserOnline`) from the global `navigator` when `window` is unavailable. In runtimes that have no `window` but do expose a global `navigator` — most notably an MV3 extension background **service worker** (where `@clerk/chrome-extension` loads the background client) — these checks previously always reported "invalid/offline". That caused `getToken()` failures to be re-thrown as a misleading `clerk_offline` error and capped network retries lower than intended. The checks now read real connectivity from the worker's `navigator`. Environments with no navigator at all (e.g. SSR) continue to report `false`, and behavior in standard browsers and React Native is unchanged.
