---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

Fix issue where we were not correctly passing the checkoutProps through within the PricingTable component. Removes internal checkoutProps prefix from PricingTableBaseProps.
