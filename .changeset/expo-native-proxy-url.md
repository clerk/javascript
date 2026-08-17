---
'@clerk/expo': patch
---

Native components now respect the `proxyUrl` passed to `<ClerkProvider>` and route Frontend API requests through the configured proxy. Applying the proxy requires a new app binary; a JS-only OTA update safely keeps the previous behavior.
