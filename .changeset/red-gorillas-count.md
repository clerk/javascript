---
'@clerk/elements': patch
---

Fix: Verification form submission wasn't working after returning from "choosing an alternate strategy" without making a selection.
Perf: Adds a `NeverRetriable` state for applicable strategies so the countdown doesn't run needlessly.
