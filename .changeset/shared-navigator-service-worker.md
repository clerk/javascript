---
'@clerk/shared': patch
---

Resolve the browser connectivity heuristics (`isValidBrowser`, `isBrowserOnline`, and therefore `isValidBrowserOnline`) from the worker's `navigator` when `window` is unavailable but the code runs inside a `WorkerGlobalScope`. In a Web/Service Worker — most notably an MV3 extension background **service worker** (where `@clerk/chrome-extension` loads the background client) — there is no `window`, so these checks previously always reported "invalid/offline". That caused `getToken()` failures to be re-thrown as a misleading `clerk_offline` error and capped network retries lower than intended. The checks now read real connectivity from the worker's `navigator`. Server-side rendering continues to report `false` (the fallback requires a real worker scope, so a bare `globalThis.navigator` such as the one modern Node exposes is not treated as a browser), and behavior in standard browsers and React Native is unchanged.
