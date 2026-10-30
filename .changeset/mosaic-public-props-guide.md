---
'@clerk/mosaic': minor
---

**Breaking:** Rename two `UserButton` and `OrganizationSwitcher` props. Values and defaults are unchanged; TypeScript flags each old name.

| Before               | After              |
| -------------------- | ------------------ |
| `renderTriggerLabel` | `showTriggerLabel` |
| `renderTriggerBadge` | `triggerBadge`     |

Find usages with `git grep -nE 'renderTrigger(Label|Badge)'`.
