# AGENTS.md

`@clerk/mosaic` rules. The repo root `AGENTS.md` still applies; for architecture see `references/mosaic-architecture.md`.

## Lint

Mosaic runs stricter lint rules than the rest of the repo (the `packages/mosaic` block in `eslint.config.mjs`).

Every disable directive in `src` needs a `-- reason` (`@eslint-community/eslint-comments/require-description`). The reason is not a code comment under the root no-comments rule. Write why the rule does not apply here, not what the code does; it is what a reviewer judges.

### When `sonarjs/cognitive-complexity` fires

The limit flags code worth a second look. It is not a score to game.

1. Simplify in place first: return early, replace branch chains with a lookup table, remove nesting.
2. Extract a helper only when it names a real concept a reader would look for. Do not split a function just to lower the score. Logic spread across helpers that only make sense together is harder to follow than one longer function.
3. If the complexity is inherent and the function reads best as one unit, disable the rule on that function with a reason:

   ```ts
   // eslint-disable-next-line sonarjs/cognitive-complexity -- One pass over the keyboard event; each branch handles a separate key.
   ```
