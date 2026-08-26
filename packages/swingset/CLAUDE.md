# CLAUDE.md

This file provides guidance to Coding Agents when working with code in this repository.

`@clerk/swingset` is a private (unpublished) component explorer — a Storybook-like app — for the **Mosaic** design system that lives in `@clerk/ui`. It is a Next.js App Router app that renders Mosaic components interactively with live knobs and design-token overrides.

## Commands

Run from the monorepo root or scope with `--filter @clerk/swingset`:

```
pnpm run dev:swingset                # next dev on port 6006
pnpm build --filter @clerk/swingset  # next build
pnpm format --filter @clerk/swingset # format-package.mjs (--check for CI)
```

There are no tests or lint scripts in this package, yet.

## Key architecture facts

These require reading several files together; the `README.md` covers the step-by-step "add a component" workflow.

- **Consumes Mosaic from source, not build.** `@clerk/ui/mosaic` is aliased to `../ui/src/mosaic` in *two* places that must stay in sync: `next.config.mjs` (webpack `resolve.alias`) and `tsconfig.json` (`paths`). Editing Mosaic source in `packages/ui` reflects live in swingset's dev server — no rebuild of `@clerk/ui` needed.

- **Knobs are generated from a story's declared variant surface.** A story's `meta.styles` is a hand-written `{ _variants, _defaultVariants }` object describing the component's variant props — StyleX compiles its styles away, so there is no runtime recipe to derive this from. `lib/generateKnobs.ts` turns each variant into a control: variants whose keys are only `true`/`false` become boolean toggles, everything else becomes a select. Knob values are passed as props straight into the story component. This is why story functions take `Record<string, unknown>` and cast to the real prop type.

- **`lib/registry.ts` is the single source of truth for which components exist**, and they are imported *explicitly* (never `import *`) so sidebar order is deterministic. `getSidebarGroups`, `getModuleBySlug`, and slugging (`lib/slug.ts`, from `meta.title`) read from it. Adding a component touches up to three wiring points: `registry.ts` (sidebar entry + per-page playground lookup), `DocsViewer.tsx`'s `docModules` map (MDX docs), and the hardcoded redirect in `app/page.tsx`.
  - ⚠️ **Add each new import and its first usage in the same edit.** The on-save lint-fix (`unused-imports/no-unused-imports` is an `error`) deletes any import that isn't referenced yet, so importing a story export in `registry.ts` (or a component in a `*.stories.tsx`) *before* the code that uses it silently drops the import and you get `X is not defined` at runtime. After wiring, `grep` the new symbol to confirm both the import and its use survived. (Repo-wide footgun; see `clerk-monorepo` skill `references/setup-and-footguns.md`.)

- **Routing.** Each component is a single page: `/components/[component]` renders its MDX overview via `DocsViewer`. There are no per-story sub-pages — the interactive playground lives *inside* the overview. `app/page.tsx` is a static redirect (currently to `/components/button`) because `registry.ts` eagerly imports story modules (client components / `createContext`), so registry-derived data can't be computed in a Server Component. `DocsViewer` also renders a "View source" link (`ViewSource.tsx`) from `meta.source` — a repo-root-relative path turned into a GitHub URL by `lib/source.ts`.

- **Shared playground state.** `DocsViewer` wraps each overview in a `PlaygroundProvider` (`PlaygroundContext.tsx`), keyed by slug and seeded from the component's `meta` via `getModuleBySlug`. It owns the knob values (props). The `<Preview>` and the interactive `<PropTable>` both read/write this single context, so editing a prop in the table updates the preview above it.

- **Every story renders inside `MosaicProvider`.** `StoryPreview` (the MDX `<Preview>`) renders a named story with the playground's knob values as props and exposes a Reset button. `StoryEmbed` (the MDX `<Story>`) renders a single static variation with default knob values and no controls.

- **The prop table is the knob surface.** `PropTable` (MDX `<PropTable>`) derives rows from `meta.styles._variants`/`_defaultVariants`, then appends the `className` + `style` escape-hatch rows every Mosaic component accepts. Each variant row renders a `KnobControl` in its **Value** column, seeded with the prop's default and bound to the playground context. The escape-hatch rows and `extra` stay static.

- **MDX.** `mdx-components.tsx` injects custom components into all MDX: `<Preview>` (→ `StoryPreview`), `<Story>` (→ `StoryEmbed`, static), `<PropTable>` (→ interactive `PropTable`), `<Usage>` (→ `UsageBlock`, a live code snippet that reflects the current knob values), and a `<pre>` override routing fenced code through Shiki (`CodeBlock`). `next.config.mjs` configures `remark-gfm` and `rehype-raw` (with MDX node pass-through) so raw HTML in tables works.

- **`<Story>` examples can show their source in a collapsible code footer.** When a story module exposes its own source as `__source` — via a `?raw` self-import (`export { default as __source } from './x.stories?raw'`) — `StoryEmbed` runs `extractStorySource` (`lib/extractStorySource.ts`) to pull the *previewed story function's* source out of that raw text, then `toUsageSnippet` (`lib/exampleSnippet.ts`) to reduce that knob harness to a clean usage snippet (unwraps `export function …() { return (…) }` down to the returned JSX and strips the `{...knobsAsProps(props)}` / `{...props}` knob plumbing), and renders a `CodeFooter` (`CodeFooter.tsx`): a "View code" toggle that's collapsed by default and reveals the snippet with a height animation (Base UI's `--collapsible-panel-height` + `data-starting/ending-style`). It's **opt-in per module** — only modules that export `__source` get a footer, and it's keyed to whichever story `name` the `<Story>` renders, so each example shows its own code. Shiki highlighting is shared with the `<pre>`/`CodeBlock` path through the `useShikiHtml` hook. A `<Story>` can carry both a code footer and a `composition` footer; they stack under the preview.
  - The `?raw` query is wired in `next.config.mjs`: an `asset/source` rule handles `?raw` imports, and — crucially — a recursive `excludeRawQuery` pass adds `resourceQuery: { not: [/raw/] }` to every *other* loader so Next's SWC loader doesn't compile the file first (otherwise `__source` would contain `_jsxDEV(…)` output instead of the authored source).

- **Two component layers.** `src/components/ui/*` are shadcn/ui primitives (`components.json`, `base-nova` style, neutral base) used for swingset's *own* chrome (sidebar, tabs, inputs). The components being *documented* come from `@clerk/ui/mosaic`. Don't confuse the two.

## Documenting Mosaic components

The facts above explain *how the app works* and `README.md` covers the *mechanical wiring* of adding a component (registry, `docModules`, redirect). This section is the **house style** — *what to write* once the wiring is in place, so every component page reads consistently.

A component's docs are two files in `src/stories/`:

- `<name>.stories.tsx` — the live demos (named React exports + a `meta`).
- `<name>.mdx` — the prose page that embeds those demos via the injected MDX tags (`<Preview>`, `<PropTable>`, `<Usage>`, `<Story>`; see the **MDX** architecture note above for the mechanism).

Pick the archetype below by the component's **layer** (its `meta.group`), then follow that archetype's required MDX section order exactly. Same archetype → same headings in the same order, every time. That uniformity is the whole point.

### Layers

`meta.group` places an entry in one of these layers. Sidebar order follows the `registry` array; group order follows first appearance there. Within a group, an optional `meta.navigation.category` sub-groups entries under a small collapsible subheading (e.g. `User Profile` splits into `Panels` and `Sections`), collapsed by default unless it contains the active page; category order also follows first appearance in the registry, and uncategorized entries render with no subheading (list them before the categorized ones). Use these exact group strings:

| Group        | What lives here                                                | Archetype |
| ------------ | -------------------------------------------------------------- | --------- |
| `User Button` | Composed flow UI (e.g. `UserButton`)                          | C         |
| `User Profile` | Composed flow UI (e.g. `UserProfileProfilePanel`)             | C         |
| `Blocks`      | Reusable prop-driven flows (e.g. `ReverificationDialog`)       | C         |
| `Components` | Styled Mosaic components — simple, with a flat variant surface (`Button`, `Input`), or compound (`Card`, `Field`, `Menu`, `Popover`) | A         |
| `Primitives` | Headless `@clerk/headless` primitives (`Accordion`)            | B         |
| `Styles`     | Atomic styles that ship as StyleX atoms, not components (`Scroll Area`) | B (adapted) |
| `Hooks`      | Headless hooks (`useDataTable`)                                | B (adapted) |

`User Button` / `User Profile` / `Blocks` → `Components` → `Primitives` runs high-level-composition → low-level-primitive. Composed layers are documented as compositions of lower layers (archetype C); leaf layers (Components, Primitives) get full prop/knob docs (archetypes A and B).

`Styles` and `Hooks` are the non-component layers: there is no element to knob, so they follow
archetype B's shape (Example → Usage → Parts → Styling) with `Props` replaced by whatever the export
actually surfaces — an argument table for a style function, a return-value table for a hook. A
`Styles` entry documents the tokens its atoms read, since those tokens _are_ its API; the
`Hooks` entry (`use-data-table.stories.tsx`) is `meta` alone, with no story exports at all, which is
the minimum a section entry needs.

Archetype A has two forms, chosen by whether the component exposes a single flat set of variant props: **simple** components (`Button`, `Input`) are knob-driven; **compound** components (`Card`, `Field`, `Menu`, `Popover`) have no flat variant props to knob, so they're documented like a primitive but themed. Both are detailed under Archetype A below.

### `meta` conventions (all archetypes)

```ts
export const meta: StoryMeta = {
  group: 'Components', // exact group string from the table
  title: 'Button', // drives slug + the page <h1>
  label: 'Delete Org', // optional friendlier sidebar text
  source: 'packages/ui/src/mosaic/components/button/button.tsx', // repo-root path → "View source"
  styles: {
    // Hand-written variant surface — archetype A · simple only
    _variants: { variant: { primary: {}, outline: {} }, size: { sm: {}, md: {} } },
    _defaultVariants: { variant: 'primary', size: 'md' },
  },
};
```

- `title` is the component's export name; it produces the slug and is what readers match against code. Set `label` only when the sidebar should read differently (the slug and page heading still come from `title`).
- `source` is always a path **relative to the monorepo root**, pointing at the file that exports the documented component. Always set it — it powers the "View source" link.
- `styles` declares the component's variant props and is **required for archetype A's simple (knob-driven) form** (it generates the knobs and the `<PropTable>`). Keep it in sync with the component's real prop union by hand — StyleX compiles its styles away, so nothing derives it for you. Omit it for compound A components, and for B and C.

Always import the component explicitly — never `import *`.

### Archetype A — styled component (`Components`)

A styled Mosaic component. Which of the two forms below applies is decided by the component's shape, not by preference: if it exposes a single flat set of variant props (declared as `meta.styles`), use the **simple** form; if it's compound — a set of parts with no flat variant props (`Card`, `Field`, `Menu`, `Popover`) — use the **compound** form.

**Every `Components`-layer story file exposes its source so each `<Story>` example renders a code footer.** Add the self-import once, right after the imports:

```ts
// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './<name>.stories?raw';
```

That's all the wiring needed — `StoryEmbed` picks `__source` up automatically and renders a collapsible "View code" footer keyed to each example's story function (see the `<Story>` code-footer architecture note above). No MDX change is required; keep authoring `<Story name='…' storyModule={…} />` as before. This applies to both A forms (simple and compound) and to every example a Components page ships.

#### A · simple — flat variant props (`Button`, `Input`)

Has a declared variant surface, so the page is **knob-driven**: an interactive canvas plus a generated prop table. Required MDX section order:

```mdx
import * as ButtonStories from './button.stories';

# Button

<!-- One present-tense paragraph: what it is, what it's for. -->

## Playground

<Preview
  name='Primary'
  storyModule={ButtonStories}
/>

## Props

<PropTable meta={ButtonStories.meta} />

## Usage

<Usage
  component='Button'
  module='@clerk/ui/mosaic/components/button'
>
  Click me
</Usage>

---

## Examples

### Sizes

<Story
  name='Sizes'
  storyModule={ButtonStories}
/>

### Disabled

<Story
  name='Disabled'
  storyModule={ButtonStories}
/>
```

- **Playground / Props / Usage are mandatory and always in this order.** The three share one playground state: editing a row in `<PropTable>` re-renders `<Preview>` above it and regenerates the `<Usage>` snippet below it.
- The story file exports a primary demo (rendered by `<Preview>`) plus one named export per variation under **Examples**. Each story takes `props: Record<string, unknown>` and casts through a local `knobsAsProps` helper — knobs are dynamically typed, the component isn't.
- Use `<PropTable>`'s `extra` for documenting non-variant props; the `className` + `style` escape-hatch rows are appended for you.
- Use `<Usage props={{…}}>` to pin static, non-knob props in the generated snippet.
- `<PropTable>` renders `Prop | Type | Default | Value`: the **Default** column is filled from `meta.styles._defaultVariants`, and the **Value** column is the live knob seeded with that default. No per-row default annotation is needed; see _Document the default value_ under Archetype B.

#### A · compound — parts, no flat variant props (`Card`, `Field`, `Menu`, `Popover`)

A compound styled component (`Popover.Root`/`Popover.Popup`/…) has no single flat prop interface to knob, so there's no `<Preview>` or `<PropTable>`. Document it like a primitive (archetype B) but themed — the difference is the **Styling** section, which lists each part's `.cl-<slot>` class and `data-<axis>` attributes rather than saying "bring your own CSS". Required MDX section order:

```mdx
import * as PopoverStories from './popover.component.stories';

# Popover

<!-- Intro: state it's the styled Mosaic component built on the `@clerk/headless`
     primitive, and that it inherits the primitive's behavior/ARIA. -->

## Example

<Story name='Default' storyModule={PopoverStories} />

## Usage

<!-- A code fence showing the compound parts composed together. -->

## Parts

<!-- Table: part | class (`.cl-<slot>`) | description. -->

## Styling

<!-- Each part's `.cl-<slot>` class and the `data-<axis>` attributes it reflects, plus
     the `--cl-*` tokens it reads, with a CSS example. -->
```

The story is `meta` (no `styles`) plus a single `Default` export that renders the composed parts. The file pair is named `<name>.component.stories.tsx` / `<name>.component.mdx` so it doesn't collide with the headless `Primitives` entry of the same title (e.g. `Menu`, `Popover` exist in both layers); the `docModules` map disambiguates by group.

### Archetype B — headless primitive (`Primitives`)

No styles, so there's no knob canvas. The single demo renders the primitive **raw (unstyled)** to show only behavior, state, and ARIA wiring. The prop/styling tables are **hand-written** (there is no variant surface to derive them from). Required MDX section order:

```mdx
# Accordion

<!-- Intro: state plainly that it's a headless primitive that ships no styles, and
     that you target its `data-*` state attributes for appearance. -->

## Example

<Story name='Default' storyModule={AccordionStories} />   <!-- the one thing prose can't show -->

## Usage

<!-- Code fences: basic, then a Controlled example, then notable variations. -->

## Parts

<!-- Table: compound part | default element | description. Note `render` polymorphism
     and which parts throw outside their parent. -->

## Props

<!-- One prop table per part (### `Accordion.Root`, ### `Accordion.Item`, …),
     columns: Prop | Type | Default | Description. Every row declares its default
     in the Default column — see the default-value note below. -->

## Styling

<!-- Table of the `data-*` state attributes each part emits, plus any exposed CSS
     custom properties (e.g. `--cl-accordion-panel-height`) with a CSS example. -->
```

The story is `meta` (no `styles`) plus a single `Default` export that renders the primitive unstyled. Don't add a `<Preview>` or `<PropTable>` — primitives have neither knobs nor a variant surface to drive them.

**Document the default value for every prop in a dedicated Default column.** Every props table — auto and hand-written — has a **Default** column; the `Type` stays a plain union/enum and the default is named in its own column (the convention every component-doc site and TypeDoc's `@default` tag follow), never inlined into the type. The auto `<PropTable>` renders `Prop | Type | Default | Value` and fills Default from `meta.styles._defaultVariants` (the **Value** column is the live knob seeded with that default); hand-written tables render `Prop | Type | Default | Description` and fill it by hand. Name the default member (`'base'`, `'multiple'`, `'bottom-start'`); use `—` when there is no default (a controlled-only or required prop) and append `(required)` for required props; when the default is behavioral rather than a literal, state it in words (`inherits Root`, `falls back to value`).

### Archetype C — composed layer (`User Button`, `User Profile`, `Blocks`)

These compose lower layers, so the docs lead with the composition rather than knobs. Required MDX:

```mdx
import * as UserButtonStories from './user-button.stories';

# UserButton

<!-- One paragraph: what state this owns and which lower-layer pieces it wires together. -->

<Story
  name='Default'
  storyModule={UserButtonStories}
  composition={[
    { name: 'Avatar', href: '/components/avatar', layer: 'Components' },
    { name: 'Item', href: '/components/item', layer: 'Components' },
    { name: 'Menu', href: '/components/menu', layer: 'Components' },
    { name: 'Popover', href: '/components/popover', layer: 'Components' },
  ]}
/>
```

- The `composition` array names each lower-layer component this one builds on, with a link to that component's page and its `layer`. List every direct dependency so the layering is navigable.
- The story is `meta` plus a single `Default` export that renders the composed UI with no knobs.

### Writing the prose

- Keep the intro to one short, present-tense paragraph: what the thing is and what it's for. For primitives, say explicitly that it's headless and ships no styles.
- Prose should add what a demo can't — behavior, accessibility, when to reach for it — not restate prop names already in the table.
- Lead every page with the heading hierarchy its archetype prescribes; don't invent new top-level sections or reorder them. Consistency across pages is the goal.

### Before you finish

- [ ] `meta.source` is set to a repo-root-relative path.
- [ ] Story renders.
- [ ] `Components`-layer story files export `__source` (the `?raw` self-import) so every `<Story>` example gets a "View code" footer.
- [ ] MDX sections match the archetype's required order exactly.
- [ ] Every props-table row states its default in the **Default** column (auto `<PropTable>` fills it from `meta.styles._defaultVariants`; `—` / `(required)` when none).
- [ ] Wiring done per `README.md`: `registry.ts`, `DocsViewer.tsx`'s `docModules`, and the `app/page.tsx` redirect if this is now the first component.
- [ ] `pnpm format --filter @clerk/swingset` is clean.
