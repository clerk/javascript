---
'@clerk/clerk-js': patch
'@clerk/clerk-react': patch
'@clerk/types': patch
---

Introduce a `toJSON()` function on resources.

This change also introduces two new internal methods on the Clerk resource, to be used by the expo package.

- `__internal_getCachedResources()`: (Optional) This function is used to load cached Client and Environment resources if Clerk fails to load them from the Frontend API.
- `__internal_reloadInitialResources()`: This funtion is used to reload the initial resources (Environment/Client) from the Frontend API.
