# Public visibility props

How to name and use props that turn part of a public component on or off. A public component is one exported from `src/index.ts`. Internal parts and views are not covered.

## Pick the shape

| What the consumer is deciding                  | Shape                       | Example                                     |
| ---------------------------------------------- | --------------------------- | ------------------------------------------- |
| Whether something appears                      | `show<Thing>`, boolean      | `showSearch`, `showTriggerLabel={false}`    |
| How something is configured, or to turn it off | `<thing>`, `false` or value | `triggerBadge={false}`, `triggerBadge={fn}` |
| Which layout to use, when they cannot combine  | Named union                 | `mode='user'`, `triggerVariant='condensed'` |
| Something on a nested page or surface          | Inside `<thing>Props`       | `apiKeysProps={{ showDescription: true }}`  |

## Rules

**Use `show<Thing>` for every boolean visibility prop.** This applies whichever way it defaults. Do not add a `hide<Thing>` prop or a `render<Thing>` boolean.

```tsx
// no
<UserButton renderTriggerLabel={false} />
<UserButton hideTriggerLabel />

// yes
<UserButton showTriggerLabel={false} />
```

**Name what the user sees.** `<Thing>` is the visible element, not the mechanism behind it: `showSearch`, not `enableSearchIndex`.

**Use a union when booleans would conflict.** If two flags can make a state that means nothing, replace them with one named union.

**Keep `render` for React output.** `render` takes an element and a `render<Thing>` prop takes an element or a function that returns one. Do not use the prefix for a boolean or for a function that returns data.

**A prop cannot override the instance.** Clerk settings and permissions decide what is available, and visibility props only choose within that. `show<Thing>` shows nothing where the feature is unavailable. For example, forced organization selection hides the personal account whatever `hidePersonal` says.

**Availability is not a prop.** When the environment or permissions decide, the model leaves out the callback or data and the view renders nothing. Branding follows `displayConfig.branded`, so it has no public prop.

**Document the default.** Give every visibility prop JSDoc that says what appears or disappears, plus `@default`.

## Exceptions

These props match the `@clerk/shared` types and keep their names:

- `hidePersonal`
- `apiKeysProps.hide`
