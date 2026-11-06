# Breaking changes

Read this when a change removes or renames a public export, prop or `.cl-` / `data-` styling hook, or changes a public type or default. It covers the changeset that ships it.

Worked example:

```md
---
'@clerk/mosaic': minor
---

**Breaking:** Rename a `UserButton` prop. Values and defaults are unchanged; TypeScript flags the old name.

| Before               | After              |
| -------------------- | ------------------ |
| `renderTriggerLabel` | `showTriggerLabel` |

Find usages with `git grep -n renderTriggerLabel`.
```

## Rules

- While `@clerk/mosaic` is on 0.x, a breaking change is a `minor` changeset.
- Start the body with `**Breaking:**`, then give an old-to-new table and a search that finds affected usage, so an agent can migrate from the changelog alone. The changelog ships in the npm package at `node_modules/@clerk/mosaic/CHANGELOG.md`.
