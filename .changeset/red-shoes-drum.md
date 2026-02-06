---
"@clerk/vue": patch
---

Fixed an error occurring in the composables where watchers attempted to call unwatch() within their own initialization.
