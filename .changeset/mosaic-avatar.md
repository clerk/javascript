---
'@clerk/ui': minor
---

Add a new Mosaic `Avatar` compound component (StyleX). `Avatar.Root` owns `shape` (`circle` | `square`) and `size` (`lg` | `md` | `sm` | `xs`); compose `Avatar.Image` (renders once the image loads) and `Avatar.Fallback` (shown while the image is pending or has failed, with an optional `delayMs`) inside it.
