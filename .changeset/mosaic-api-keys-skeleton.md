---
'@clerk/mosaic': patch
---

`APIKeysTable` now shows skeleton rows instead of a spinner while the first page of keys loads, and announces "API keys loaded" to screen readers when the keys arrive. Override the new message with `messages.loaded`.
