---
'@clerk/clerk-react': minor
---

Adjustments to support "Keyless mode".
- A new internal-only prop `__internal_bypassMissingPublishableKey` that disables throwing an error when a publishable key is missing.
- No longer attempt to load clerk-js when a missing key is not passed.
- Create a new instance of IsomorphicClerk when a different publishable key is used.
- 

