---
'@clerk/mosaic': minor
---

Add `terms` to Mosaic's localization catalog, so the word for an organization can be changed in one place. Set `terms.organization` to `{ one: 'workspace', other: 'workspaces' }` and every built-in string uses it, capitalized where needed. The default is still "organization", and a specific key override still wins over a term.

Custom strings can use `{organization}`, `{organizations}`, `{Organization}` and `{Organizations}`.
