---
'@clerk/astro': patch
---

Fix `$billingStore` so it emits the billing namespace only after Clerk has loaded. Before, it could emit while `clerk.load()` was still running, so a call like `getPlans()` in a subscriber could fail with a `dev_browser_unauthenticated` error on development instances.
