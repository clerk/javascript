---
"@clerk/elements": minor
---

Improve `<FieldState>` and re-organize some data attributes related to validity states. These changes might be breaking changes for you.

Overview of changes:

- `<form>` no longer has `data-valid` and `data-invalid` attributes. If there are global errors (same heuristics as `<GlobalError>`) then a `data-global-error` attribute will be present.
- Fixed a bug where `<Field>` could contain `data-valid` and `data-invalid` at the same time.
- The field state (accessible through e.g. `<FieldState>`) now also incorporates the field's [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) into its output. If the `ValidityState` is invalid, the field state will be an `error`. You can access this information in three places:
  1. `<FieldState>`
  2. `data-state` attribute on `<Input>`
  3. `<Field>{(state) => <p>Field's state is {state}</p>}</Field>`
