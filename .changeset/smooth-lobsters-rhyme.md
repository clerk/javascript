---
'@clerk/elements': minor
---

With this change `<SignIn.Step name="choose-strategy">` and `<SignIn.Step name="forgot-password">` now render a `<div>`. This aligns them with all other `<Step>` components (which render an element, mostly `<form>`).

**Required action:** Update your markup to account for the new `<div>`, e.g. by removing an element you previously added yourself and moving props like `className` to the `<Step>` now. This change can be considered a breaking change so check if you're affected.
