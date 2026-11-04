# CLAUDE.md

This file provides guidance to Coding Agents when working with code in this repository.

`@clerk/swingset` is a private (unpublished) component explorer — a Storybook-like app — for the **Mosaic** design system that lives in `@clerk/mosaic`. It is a Next.js App Router app that renders Mosaic components interactively with live knobs and design-token overrides.

## Commands

Run from the monorepo root or scope with `--filter @clerk/swingset`:

```
pnpm run dev:swingset                # next dev on $PORT (default 6006), or the next free port
pnpm build --filter @clerk/swingset  # next build
pnpm format --filter @clerk/swingset # format-package.mjs (--check for CI)
```

There is no lint script in this package.

Swingset has no tests, and none should be added. Don't add test files, a Vitest config, or a `test` script here. Test components and flows in `@clerk/mosaic`, next to the code they cover. Stories and fixtures exist only to drive the explorer, so don't add options or exports to them for tests.

## Key architecture facts

These require reading several files together; the `README.md` covers the step-by-step "add a component" workflow.

- **Consumes Mosaic from source, not build.** `@clerk/mosaic` is aliased to `../mosaic/src` in _three_ places that must stay in sync: `tsconfig.json` (`paths`), and in `next.config.mjs` both the webpack `resolve.alias` and the StyleX plugin's `aliases`. Editing Mosaic source in `packages/mosaic` reflects live in swingset's dev server — no rebuild of `@clerk/mosaic` needed.

- **Knobs are generated from a story's declared variant surface.** A story's `meta.styles` is a hand-written `{ _variants, _defaultVariants }` object describing the component's variant props — StyleX compiles its styles away, so there is no runtime recipe to derive this from. `src/lib/generateKnobs.ts` turns each variant into a control: variants whose keys are only `true`/`false` become boolean toggles, everything else becomes a select. Knob values are passed as props straight into the story component. This is why story functions take `Record<string, unknown>` and cast to the real prop type.

- **`src/lib/registry.ts` is the single source of truth for which components exist**, and they are imported _explicitly_ (never `import *`) so sidebar order is deterministic. `getSidebarGroups`, `getModule(groupSlug, componentSlug)`, and slugging (`src/lib/slug.ts`, from `meta.title`) read from it. Adding a component touches up to three wiring points: `registry.ts` (sidebar entry + per-page playground lookup), `DocsViewer.tsx`'s `docModules` map (MDX docs), and the hardcoded redirect in `app/(explorer)/page.tsx`.
  - ⚠️ **Add each new import and its first usage in the same edit.** The on-save lint-fix (`unused-imports/no-unused-imports` is an `error`) deletes any import that isn't referenced yet, so importing a story export in `registry.ts` (or a component in a `*.stories.tsx`) _before_ the code that uses it silently drops the import and you get `X is not defined` at runtime. After wiring, `grep` the new symbol to confirm both the import and its use survived. (Repo-wide footgun; see `clerk-monorepo` skill `references/setup-and-footguns.md`.)

- **Routing.** Route groups split the app: `(explorer)` is the component playground, `(clerk)` is the Live Sandbox (`/live`, `/sign-in`, `/sign-up`) and needs keys from `packages/swingset/.env.local`. Each component is a single page: `(explorer)/[group]/[component]` renders its MDX overview via `DocsViewer`. There are no per-story sub-pages — the interactive playground lives _inside_ the overview. `app/(explorer)/page.tsx` is a static redirect (currently to `/components/button`) because `registry.ts` eagerly imports story modules (client components / `createContext`), so registry-derived data can't be computed in a Server Component. `DocsViewer` also renders a "View source" link (`ViewSource.tsx`) from `meta.source` — a repo-root-relative path turned into a GitHub URL by `src/lib/source.ts`.

- **Live Sandbox pages.** Every `app/(clerk)/live/*/page.tsx` opens with `LivePageHeader` (`app/(clerk)/live-page-header.tsx`), which renders the page's `h1` and, beside it, the entry's status badge (`StatusBadge`) looked up from `livePages` in `src/lib/live-navigation.ts`. The badge belongs in the title row, where the reader is looking, mirroring the docs pages' `DocTitle` — never in the sticky header chrome. Don't hand-write an `h1` on a live page; pass the title and description to `LivePageHeader` so the badge stays attached. The live sidebar is also the inventory for the User Profile and Organization Profile groups: every Panels/Sections entry from the registry appears there, and one without a route in `livePages` renders as a gray `todo` placeholder (`live/todo/[group]/[component]`, a dashed gray box labelled TODO). When you add a live harness for one, add its route to `livePages` and the placeholder disappears.

- **Shared playground state.** `DocsViewer` wraps each overview in a `PlaygroundProvider` (`PlaygroundContext.tsx`), keyed by slug and seeded from the component's `meta` via `getModule`. It owns the knob values (props). The `<Preview>` and the interactive `<PropTable>` both read/write this single context, so editing a prop in the table updates the preview above it.

- **Every story renders inside `MosaicProvider`.** `StoryPreview` (the MDX `<Preview>`) renders a named story with the playground's knob values as props and exposes a Reset button. `StoryEmbed` (the MDX `<Story>`) renders a single static variation with default knob values and no controls.
  - The header's **RTL** switch (`DirectionToggle`, state in `DirectionProvider`) sets `dir` on `<html>`. It has to sit that high because popover and menu popups portal to `<body>`, so a `dir` on the preview container would never reach them; swingset's own chrome flips along with the story.
  - The header's **Chaos** switch (`ChaosToggle`, state in `ChaosProvider`) stress-tests layouts with worst-case data that still reads as real: long names, companies, emails and places across scripts and RTL, plus long row counts. `StoryMosaicProvider` (used by both story renderers) remounts the story on toggle so fixture state reseeds. UI copy stays the built-in English. Fixtures opt their seed data in with `useChaosFixture(data, toChaos)`, building the chaos version from the helpers in `src/lib/chaos.ts`. Never stretch copy with filler; pick a longer value someone would actually type. When you add a fixture, wrap its seed data the same way.

- **The prop table is the knob surface.** `PropTable` (MDX `<PropTable>`) derives rows from `meta.styles._variants`/`_defaultVariants`, then appends the `xstyle` escape-hatch row every Mosaic component accepts. Each variant row renders a `KnobControl` in its **Value** column, seeded with the prop's default and bound to the playground context. The `xstyle` row and `extra` stay static.

- **MDX.** `mdx-components.tsx` injects custom components into all MDX: `<Preview>` (→ `StoryPreview`), `<Story>` (→ `StoryEmbed`, static), `<PropTable>` (→ interactive `PropTable`), `<Usage>` (→ `UsageBlock`, a live code snippet that reflects the current knob values), and a `<pre>` override routing fenced code through Shiki (`CodeBlock`). `next.config.mjs` configures `remark-gfm` and `rehype-raw` (with MDX node pass-through) so raw HTML in tables works.

- **`<Story>` examples can show their source in a collapsible code footer.** When a story module exposes its own source as `__source` — via a `?raw` self-import (`export { default as __source } from './x.stories?raw'`) — `StoryEmbed` runs `extractStorySource` (`src/lib/extractStorySource.ts`) to pull the _previewed story function's_ source out of that raw text, then `toUsageSnippet` (`src/lib/exampleSnippet.ts`) to reduce that knob harness to a clean usage snippet (unwraps `export function …() { return (…) }` down to the returned JSX and strips the `{...knobsAsProps(props)}` / `{...props}` knob plumbing), and renders a `CodeFooter` (`CodeFooter.tsx`): a "View code" toggle that's collapsed by default and reveals the snippet with a height animation (Base UI's `--collapsible-panel-height` + `data-starting/ending-style`). It's **opt-in per module** — only modules that export `__source` get a footer, and it's keyed to whichever story `name` the `<Story>` renders, so each example shows its own code. Shiki highlighting is shared with the `<pre>`/`CodeBlock` path through the `useShikiHtml` hook. A `<Story>` can carry both a code footer and a `composition` footer; they stack under the preview.
  - The `?raw` query is wired in `next.config.mjs`: an `asset/source` rule handles `?raw` imports, and — crucially — a recursive `excludeRawQuery` pass adds `resourceQuery: { not: [/raw/] }` to every _other_ loader so Next's SWC loader doesn't compile the file first (otherwise `__source` would contain `_jsxDEV(…)` output instead of the authored source).

- **Two component layers.** `src/components/ui/*` are shadcn/ui primitives (`components.json`, `base-nova` style, neutral base) used for swingset's _own_ chrome (sidebar, tabs, inputs). The components being _documented_ come from `@clerk/mosaic`. Don't confuse the two.

## Documenting Mosaic components

Before adding a component page or restructuring a story or MDX page, read the house style in `.claude/skills/mosaic/references/documenting-components.md`: layers, `meta` conventions, each archetype's required section order, and the finishing checklist.
