---
"@clerk/elements": patch
---

Add a development-only warning for cases when a user renders a `<Strategy>` component that isn't activated for their Clerk instance. As this can be intended behavior (e.g. build out a full example and let user enable/disable stuff solely in the dashboard) the warning can safely be ignored if necessary.
