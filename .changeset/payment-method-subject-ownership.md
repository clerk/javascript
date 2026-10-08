---
'@clerk/ui': patch
---

Payment method forms close when the active account changes. Commands from the previous account cannot change the new account's payment methods. Repeated form submissions share one request, and forms that have closed no longer complete pending provider submissions or reset the provider. Payment methods update their order when the default method changes.
