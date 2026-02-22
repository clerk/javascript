---
'@clerk/clerk-js': patch
'@clerk/ui': patch
---

Preload component chunks in parallel with the common chunk during mount, reducing first-render latency on slow connections.
