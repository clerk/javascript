---
'@clerk/clerk-js': patch
---

Fix `touchSession` option to only affect session touch behavior to window focus events.

Previously, when `touchSession: false` was provided, it incorrectly prevented session touching during `setActive()` calls when switching sessions or selecting organizations.
