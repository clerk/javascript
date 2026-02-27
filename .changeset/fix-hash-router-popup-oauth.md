---
'@clerk/clerk-js': patch
---

Fix HashRouter not responding to popup OAuth navigations by adding `pushstate`/`replacestate` to refresh events and suppressing the history observer during external navigation.
