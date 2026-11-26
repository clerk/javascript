---
'@clerk/mosaic': patch
---

A `Card` with `elevation='flush'` now drops its edge padding so its content runs to its edges, and a card nested in another card takes that card's elevation unless it sets its own. A sign-in or sign-up card placed inside a flush `Card` now sits flat on the page, with no background, shadow, padding or divider above the branding.
