---
'@clerk/localizations': patch
'@clerk/clerk-js': patch
'@clerk/types': patch
---

- Adds support for collecting and verifying user email (when they don't already have one associated with their payer) during checkout
- Fixes incorrect org invoices endpoint.
- Extracts plan CTA button styling, labeling, and selecting into context methods.
- Adds UserProfile / OrgProfile specific scrollbox IDs for drawer portal-ing (fixes issue where both could be open)
- Fixes incorrect button action in SubscriptionList for active but expiring subscriptions.