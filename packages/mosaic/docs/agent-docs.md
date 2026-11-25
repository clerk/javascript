# Agent docs

Read this when you add or change a `*.doc.ts` file or `src/docs-schema.ts`. A `*.doc.ts` describes one unit for the docs site and for agents: what it is for, its parts or options with their props, and the rules a caller breaks. For the Swingset page people browse, read [Documenting components](documenting-components.md).

Worked examples: `src/components/avatar/avatar.doc.ts` (a compound component), `src/components/button/button.doc.ts` and `src/components/button/submit-button.doc.ts` (two components in one folder), `src/components/table/table.doc.ts` (a generic component), `src/hooks/use-pending-action.doc.ts` (a hook).

## Rules

- **One doc per unit, next to it.** A component or primitive gets `<name>.doc.ts` in its folder, beside `index.ts`. A second component exported from the same folder, such as `SubmitButton`, gets its own `<name>.doc.ts` there, so it has its own page. A hook gets `src/hooks/use-<name>.doc.ts` beside `use-<name>.ts`. Tools find docs by these paths only.
- **Type it against the real props.** End the default export with `satisfies ComponentDoc<{ 'Part.Name': PartProps }>` or `satisfies HookDoc<Options, Result>`, using the types the unit exports. A renamed or removed prop then fails `pnpm typecheck`. Never widen with `Record<string, …>` or a cast.
- **Import types only.** A doc uses `import type` and no runtime imports, so plain Node loads it without JSX or StyleX. Docs never ship: the build entry is `src/index.ts` and nothing imports a doc.
- **Every part is exported.** A part named `Avatar.Root` needs `Avatar` exported as a value from the unit's `index.ts`; a hook doc needs its `name` exported.
- **A doc publishes its unit.** A documented component or primitive imports from `@clerk/mosaic/<kind>/<slug>` ([Publishing a unit](#publishing-a-unit)), and its `index.ts` exports only the names its doc lists, plus types: each part in `parts`, and each helper in `exports`, such as `'Panel.usePanelTitle': { description }`.
- **Say what the types cannot.** Write `useFor` as the needs an agent would search for, such as "a confirm step before an action". Props get a one-line `doc` and the `default` as code. Practices hold the rules a caller breaks, each with the fix.
- **Write each prop's `type` as the reader should see it.** Use `'sm' | 'md'`, `(open: boolean) => void`, or a name the component's source file already uses, such as `ReactNode` or `DialogFocusTarget`. Never name the props type it is checked against, such as `ButtonProps['size']`. Leave out `| undefined` for optional props. `pnpm typecheck` checks prop names, not this text, so copy it from the source.
- **Generic props keep the source's type parameter.** Write `(item: Item) => React.ReactNode`, not `(item: unknown) => …`, using the name the props type declares, such as `Item`, `Value` or `Payload`.
- **Example `code` is a template literal at column 0.** Open the backtick, start the code on the next line, and close the backtick on its own line. Readers trim the wrapping newlines.
- **A `playground` gives a component one live preview on the docs site.** Set it on the doc, naming the part it controls: `playground: { part: 'Button', defaults: { children: 'Save changes' } }`. Each prop of that part typed as a string-literal union, `boolean`, `string` or `ReactNode` gets a control, so write a union's type as its members, such as `"'md' | 'lg'"`, not its alias. A compound component controls its root and composes the rest in `defaults.children` as elements, `{ __element: 'Card.Title', children: 'Title' }`; the preview and the Code tab are both built from them. Each element name is wired to its component in `packages/mosaic-docs/src/examples/playgrounds.tsx`. Worked examples: `button.doc.ts`, and `card.doc.ts` for a compound component.
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

## Publishing a unit

Each documented component and primitive is a subpath export that renders from a React Server Component. `pnpm build` runs `scripts/check-docs-exports.mjs` and `scripts/check-bundle.mjs`, which fail on a unit that breaks these rules.

- Add `./<kind>/<slug>` to `exports` in `package.json` (`types`, `import` and `default` under `./dist/<kind>/<slug>`) and the matching entry in `tsdown.config.mts`, beside `components/avatar`.
- `index.ts` has no `'use client'`. A compound re-exports its namespace from a directive-free parts module (`src/components/avatar/avatar.parts.ts`, or `parts.ts` in a primitive); a single component re-exports it from its leaf (`src/components/badge/`). A helper a caller needs is a member of the namespace, such as `Panel.usePanelTitle`, and is listed in the doc's `exports`.
- A module the entry reaches before any `'use client'` module imports only relative modules. If it imports React or any other package, it starts with `'use client'`, so each part stays a client component when the index is imported on the server. A context or hook module that only `'use client'` modules import needs no directive.
- A published glyph (`./icons/glyphs/<name>`) starts with `'use client'`, so a Server Component can pass it to `Icon` as a client reference. `src/icons/glyph.tsx` takes no directive, because each glyph calls it while it loads.
- A unit left off the docs site gets no export. It is listed in `unpublished` in `scripts/check-docs-exports.mjs`.
