---
'@clerk/ui': minor
---

Add a new Mosaic `Avatar` compound component (StyleX). `Avatar` owns `shape` (`circle` | `square`) and `size` (`lg` | `md` | `sm` | `xs`); compose `AvatarImage` (renders once the image loads) and `AvatarFallback` (shown while the image is pending or has failed, with an optional `delayMs`) inside it.
