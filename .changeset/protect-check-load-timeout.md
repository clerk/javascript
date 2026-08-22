---
'@clerk/clerk-js': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Bound loading the verification module rather than running it. The SDK no longer imposes a time limit on a verification once it has started, since how long one legitimately takes depends on the verification itself. The load timeout can be set per loader, falling back to a per-instance value and then to the default.
