# Agent docs

Read this when you add or change a `*.doc.ts` file or `src/docs-schema.ts`. A `*.doc.ts` describes one unit for the docs site and for agents: what it is for, its parts or options with their props, and the rules a caller breaks. For the Swingset page people browse, read [Documenting components](documenting-components.md).

Worked examples: `src/components/avatar/avatar.doc.ts` (a compound component), `src/components/button/button.doc.ts` (parts without a dot), `src/components/table/table.doc.ts` (a generic component), `src/hooks/use-pending-action.doc.ts` (a hook).

## Rules

- **One doc per unit, next to it.** A component or primitive gets `<name>.doc.ts` in its folder, beside `index.ts`. A hook gets `src/hooks/use-<name>.doc.ts` beside `use-<name>.ts`. Tools find docs by these paths only.
- **Type it against the real props.** End the default export with `satisfies ComponentDoc<{ 'Part.Name': PartProps }>` or `satisfies HookDoc<Options, Result>`, using the types the unit exports. A renamed or removed prop then fails `pnpm typecheck`. Never widen with `Record<string, …>` or a cast.
- **Import types only.** A doc uses `import type` and no runtime imports, so plain Node loads it without JSX or StyleX. Docs never ship: the build entry is `src/index.ts` and nothing imports a doc.
- **Every part is exported.** A part named `Avatar.Root` needs `Avatar` exported as a value from the unit's `index.ts`; a hook doc needs its `name` exported.
- **Say what the types cannot.** Write `useFor` as the needs an agent would search for, such as "a confirm step before an action". Props get a one-line `doc` and the `default` as code. Practices hold the rules a caller breaks, each with the fix.
- **Write each prop's `type` as the reader should see it.** Use `'sm' | 'md'`, `(open: boolean) => void`, or a name the component's source file already uses, such as `ReactNode` or `DialogFocusTarget`. Never name the props type it is checked against, such as `ButtonProps['size']`. Leave out `| undefined` for optional props. `pnpm typecheck` checks prop names, not this text, so copy it from the source.
- **Generic props keep the source's type parameter.** Write `(item: Item) => React.ReactNode`, not `(item: unknown) => …`, using the name the props type declares, such as `Item`, `Value` or `Payload`.
- **Example `code` is a template literal at column 0.** Open the backtick, start the code on the next line, and close the backtick on its own line. Readers trim the wrapping newlines.
- **Slots are the full class.** `slot: 'cl-avatar'`, matching `themeProps('avatar')`.
- **A rule from this package's docs is linked, not copied.** Name the owner in a practice, such as "Use `usePendingAction` instead", and keep the rule itself in its guide.

## How to

1. Copy the worked example that matches the unit's shape.
2. Fill `name`, `description`, `useFor`, then `parts` (component) or `options` and `returns` (hook). The full shape is in `src/docs-schema.ts`.
3. Run the checks:

   ```sh
   pnpm --filter @clerk/mosaic typecheck
   pnpm --filter @clerk/mosaic lint
   ```
