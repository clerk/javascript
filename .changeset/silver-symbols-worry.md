---
'@clerk/clerk-js': patch
---

Incremental improvements for account funds in checkout.

- Fixes CLS issues when rendering account funds
- Renames "accounts funds" to "payment sources" for consistency
- Auto opes the "Add a new payment source" drawer only if no payments sources exist
