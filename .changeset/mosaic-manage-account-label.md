---
'@clerk/mosaic': minor
---

**Breaking:** The Settings submenu in `UserButton` and `OrganizationSwitcher` now reads "Manage account" instead of "Manage profile", and its message key is renamed to match. TypeScript flags overrides that still use the old key.

| Before                                  | After                                   |
| --------------------------------------- | --------------------------------------- |
| `userButton.manage.profile`             | `userButton.manage.account`             |
| `organizationSwitcher.manage.profile`   | `organizationSwitcher.manage.account`   |

Find usages with `git grep -nE "manage\.profile|manage: *\{"`.
