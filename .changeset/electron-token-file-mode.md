---
'@clerk/electron': patch
---

The token file written by `storage()` from `@clerk/electron/storage` is now readable and writable only by its owner (`0600`). It was previously world-readable (`0644` under the default umask). Existing token files are updated the next time `storage()` is called.
