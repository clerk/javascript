# Public visibility props

Read this when you add or rename a prop on a public component that shows, hides or configures part of it. It covers naming and shape; a public component is one exported from `src/index.ts`, and internal parts and views are not covered.

Worked example: `showTriggerLabel` on `UserButton`.

## Rules

- Every boolean visibility prop is `show<Thing>`, whichever way it defaults. No `hide<Thing>` and no `render<Thing>` boolean (`<UserButton showTriggerLabel={false} />`, not `renderTriggerLabel={false}` or `hideTriggerLabel`).
- Name what the user sees, not the mechanism: `showSearch`, not `enableSearchIndex`.
- When two booleans could make a state that means nothing, replace them with one named union.
- `render` is for React output: `render` takes an element, and `render<Thing>` takes an element or a function that returns one. Never a boolean or a function that returns data.
- A prop cannot override the instance. Clerk settings and permissions decide what is available, and a visibility prop only chooses within that: `show<Thing>` shows nothing where the feature is unavailable, and forced organization selection hides the personal account whatever `hidePersonal` says.
- Availability is not a prop. When the environment or permissions decide, the model omits the callback or data and the view renders nothing. Branding follows `displayConfig.branded`, so it has no public prop.
- Give every visibility prop JSDoc that says what appears or disappears, plus `@default`.

## Pick the shape

| What the consumer is deciding                  | Shape                       | Example                                     |
| ---------------------------------------------- | --------------------------- | ------------------------------------------- |
| Whether something appears                      | `show<Thing>`, boolean      | `showSearch`, `showTriggerLabel={false}`    |
| How something is configured, or to turn it off | `<thing>`, `false` or value | `triggerBadge={false}`, `triggerBadge={fn}` |
| Which layout to use, when they cannot combine  | Named union                 | `mode='user'`, `triggerVariant='condensed'` |
| Something on a nested page or surface          | Inside `<thing>Props`       | `apiKeysProps={{ showDescription: true }}`  |

## Exceptions

These match the `@clerk/shared` types and keep their names: `hidePersonal` and `apiKeysProps.hide`.

Renaming an existing public prop is a breaking change ([Breaking changes](../AGENTS.md#breaking-changes)).
