---
'@clerk/electron': patch
---

Keep the current client token available for the lifetime of the Electron app when secure persistence is unavailable or fails.

Fixed a race where an older in-flight token write could replace a newer token when multiple requests completed at the same time.
