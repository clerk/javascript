# Lint

Read this when a lint rule fires in `packages/mosaic`, or before you add a disable directive. It covers how to respond to a complexity warning and how to write a disable; the rules themselves are in `oxlint.config.mjs`.

Mosaic runs Oxlint with stricter rules than the rest of the repo. Lint with `pnpm lint` from `packages/mosaic`.

## Rules

- Do not extract a helper, introduce a machine, or turn a component into a hook only to lower a lint score or work around React's children typing. An abstraction must clarify a responsibility or hide useful complexity.
- Every disable directive in `src` needs a `-- reason` (`require-description`). Write why the rule does not apply here, not what the code does; it is what a reviewer judges. The reason is not a code comment, so the no-comments rule does not apply to it.
- This guide does not authorize a suppression. When complexity is inherent, keep the logic together and explain the tradeoff in review.

## Custom rules

Mosaic's own rules live in `lint/rules/`, one rule per file with its test next to it (`<rule>.ts` and `<rule>.test.ts`). Oxlint loads them through `lint/plugin.ts` under the `mosaic/` prefix. To add a rule, add the file and its test, register it in `plugin.ts`, and turn it on in `oxlint.config.mjs`. Run the rule tests with `pnpm vitest run --project lint-rules` from `packages/mosaic`; `pnpm test` includes them.

## When `mosaic/model-callbacks-return-clerk-call` fires

Wrap the callback in `callClerk` and type it as a `ClerkCall`. When the type is not a model callback, such as a view contract a controller fills or a prop the app supplies, disable the rule on that line with the reason (`requests-table-tab.types.ts`). The rule and its reason live in [Models → Errors](models.md#errors).

## When `sonarjs/cognitive-complexity` fires

The limit (15) flags code worth a second look. It is not a score to game.

1. Simplify in place first: return early, replace branch chains with a lookup table, remove nesting.
2. Extract a helper only when it names a real concept a reader would look for. Logic spread across helpers that only make sense together is harder to follow than one longer function.
3. If the complexity is inherent and the function reads best as one unit, disable the rule on that function with a reason:

   ```ts
   // eslint-disable-next-line sonarjs/cognitive-complexity -- One pass over the keyboard event; each branch handles a separate key.
   ```
