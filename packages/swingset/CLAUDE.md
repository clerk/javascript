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

- **Knobs are generated from CVA metadata, not hand-written.** A story's `meta.styles` is a Mosaic CVA style object exposing `_variants` / `_defaultVariants`. `lib/generateKnobs.ts` turns each variant into a control: variants whose keys are only `true`/`false` become boolean toggles, everything else becomes a select. Knob values are passed as props straight into the story component. This is why story functions take `Record<string, unknown>` and cast to the real prop type.

- **`lib/registry.ts` is the single source of truth for which components exist**, and they are imported *explicitly* (never `import *`) so sidebar order is deterministic. `getSidebarGroups`, `getModuleBySlug`, and slugging (`lib/slug.ts`, from `meta.title`) read from it. Adding a component touches up to three wiring points: `registry.ts` (sidebar entry + per-page playground lookup), `DocsViewer.tsx`'s `docModules` map (MDX docs), and the hardcoded redirect in `app/page.tsx`.

- **Routing.** Each component is a single page: `/components/[component]` renders its MDX overview via `DocsViewer`. There are no per-story sub-pages — the interactive playground lives *inside* the overview. `app/page.tsx` is a static redirect (currently to `/components/button`) because `registry.ts` eagerly imports story modules (Emotion / `createContext`), so registry-derived data can't be computed in a Server Component. `DocsViewer` also renders a "View source" link (`ViewSource.tsx`) from `meta.source` — a repo-root-relative path turned into a GitHub URL by `lib/source.ts`.

- **Shared playground state.** `DocsViewer` wraps each overview in a `PlaygroundProvider` (`PlaygroundContext.tsx`), keyed by slug and seeded from the component's `meta` via `getModuleBySlug`. It owns the knob values (props) and live `MosaicVariables`. The `<Preview>` and the interactive `<PropTable>` both read/write this single context, so editing a prop in the table updates the preview above it.

- **Every story renders inside `MosaicProvider`.** `StoryPreview` (the MDX `<Preview>`) renders a named story with the playground's knob values as props, applies the variable overrides, and exposes a Reset button plus a collapsible `VariablesPanel` attached to the preview. `StoryEmbed` (the MDX `<Story>`) renders a single static variation with default knob values and no controls.

- **The prop table is the knob surface.** `PropTable` (MDX `<PropTable>`) derives rows from `meta.styles._variants`/`_defaultVariants` (always appends `sx`); each variant row renders a `KnobControl` in its **Value** column, seeded with the prop's default and bound to the playground context. Non-variant rows (`sx`, `extra`) stay static.

- **Variables live in the preview.** The `VariablesPanel` is a collapsible attached to `StoryPreview` (toggled from the preview's header), bound to the shared playground context so editing a Mosaic token override immediately re-themes the story rendered above it.

- **MDX.** `mdx-components.tsx` injects custom components into all MDX: `<Preview>` (→ `StoryPreview`), `<Story>` (→ `StoryEmbed`, static), `<PropTable>` (→ interactive `PropTable`), `<Usage>` (→ `UsageBlock`, a live code snippet that reflects the current knob values), and a `<pre>` override routing fenced code through Shiki (`CodeBlock`). `next.config.mjs` configures `remark-gfm` and `rehype-raw` (with MDX node pass-through) so raw HTML in tables works.

- **Two component layers.** `src/components/ui/*` are shadcn/ui primitives (`components.json`, `base-nova` style, neutral base) used for swingset's *own* chrome (sidebar, tabs, inputs). The components being *documented* come from `@clerk/ui/mosaic`. Don't confuse the two. Mosaic stories use Emotion (`/** @jsxImportSource @emotion/react */` pragma; `compiler.emotion` enabled in Next).

## Documenting Mosaic components

The facts above explain *how the app works* and `README.md` covers the *mechanical wiring* of adding a component (registry, `docModules`, redirect). This section is the **house style** — *what to write* once the wiring is in place, so every component page reads consistently.

A component's docs are two files in `src/stories/`:

- `<name>.stories.tsx` — the live demos (named React exports + a `meta`).
- `<name>.mdx` — the prose page that embeds those demos via the injected MDX tags (`<Preview>`, `<PropTable>`, `<Usage>`, `<Story>`; see the **MDX** architecture note above for the mechanism).

Pick the archetype below by the component's **layer** (its `meta.group`), then follow that archetype's required MDX section order exactly. Same archetype → same headings in the same order, every time. That uniformity is the whole point.

### Layers

`meta.group` places a component in one of six layers. Sidebar order follows the `registry` array; group order follows first appearance there. Use these exact group strings:

| Group        | What lives here                                                | Archetype |
| ------------ | -------------------------------------------------------------- | --------- |
| `AIO`        | All-in-one flows (e.g. `OrganizationProfile`)                  | C         |
| `Panels`     | A pane within a flow (e.g. `OrganizationProfileGeneral`)       | C         |
| `Sections`   | Self-contained feature sections (e.g. `DeleteOrganization`)    | C         |
| `Blocks`     | Reusable composite UI (e.g. `Destructive`)                     | C         |
| `Components` | Styled Mosaic components — simple CVA recipe (`Button`, `Input`) or compound/slot-based (`Dialog`, `Tabs`) | A         |
| `Primitives` | Headless `@clerk/headless` primitives (`Accordion`)            | B         |

`AIO` → `Panels` → `Sections` → `Blocks` → `Components` → `Primitives` runs roughly high-level-composition → low-level-primitive. Composed layers (AIO/Panels/Sections/Blocks) are documented as compositions of lower layers (archetype C); leaf layers (Components, Primitives) get full prop/knob docs (archetypes A and B).

Archetype A has two forms, chosen by whether the component exposes a single flat CVA recipe: **simple** components (`Button`, `Input`) are knob-driven; **compound** components built from slot recipes (`Dialog`, `Tabs`) have no flat variant props to knob, so they're documented like a primitive but themed. Both are detailed under Archetype A below.

### `meta` conventions (all archetypes)

```ts
export const meta: StoryMeta = {
  group: 'Components', // exact group string from the table
  title: 'Button', // drives slug + the page <h1>
  label: 'Delete Org', // optional friendlier sidebar text
  source: 'packages/ui/src/mosaic/components/button.tsx', // repo-root path → "View source"
  styles: buttonRecipe, // CVA recipe — archetype A · simple only
};
```

- `title` is the component's export name; it produces the slug and is what readers match against code. Set `label` only when the sidebar should read differently (the slug and page heading still come from `title`).
- `source` is always a path **relative to the monorepo root**, pointing at the file that exports the documented component. Always set it — it powers the "View source" link.
- `styles` is the component's CVA recipe/style object and is **required for archetype A's simple (knob-driven) form** (it generates the knobs and the `<PropTable>`). Omit it for compound A components, and for B and C.

Story files that render styled Mosaic components must start with the Emotion pragma `/** @jsxImportSource @emotion/react */`. Headless-primitive demos render raw and don't need it. Always import the component and its recipe explicitly — never `import *`.

### Archetype A — styled component (`Components`)

A styled Mosaic component. Which of the two forms below applies is decided by the component's shape, not by preference: if it exposes a single flat CVA recipe (`meta.styles`), use the **simple** form; if it's compound — built from slot recipes with no flat variant props (`Dialog`, `Tabs`) — use the **compound** form.

#### A · simple — single CVA recipe (`Button`, `Input`)

Has a CVA recipe, so the page is **knob-driven**: an interactive canvas plus an auto-generated prop table. Required MDX section order:

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
- Use `<PropTable>`'s `extra` for documenting non-variant props; `sx` is appended for you.
- Use `<Usage props={{…}}>` to pin static, non-knob props in the generated snippet.
- `<PropTable>` renders `Prop | Type | Default | Value`: the **Default** column is filled automatically from the recipe's `_defaultVariants`, and the **Value** column is the live knob seeded with that default. No manual default annotation is needed; see _Document the default value_ under Archetype B.

#### A · compound — slot recipes, no flat CVA (`Dialog`, `Tabs`)

A compound styled component (`Dialog.Root`/`Dialog.Popup`/…) has no single flat prop interface to knob, so there's no `<Preview>` or `<PropTable>`. Document it like a primitive (archetype B) but themed — the difference is the **Styling** section, which describes the Mosaic recipe and per-slot `appearance.elements` overrides rather than "bring your own CSS". Required MDX section order:

```mdx
import * as DialogStories from './dialog.component.stories';

# Dialog

<!-- Intro: state it's the styled Mosaic component composed from the `@clerk/headless`
     primitive + slot recipes, and that it inherits the primitive's behavior/ARIA. -->

## Example

<Story name='Default' storyModule={DialogStories} />

## Usage

<!-- A code fence showing the compound parts composed together. -->

## Parts

<!-- Table: part | slot (`data-cl-slot`) | description. -->

## Styling

<!-- How the Mosaic recipe themes each slot, and how to override per slot via
     `appearance.elements` (e.g. `{ 'dialog-popup': { borderRadius: 24 } }`). -->
```

The story is `meta` (no `styles`) plus a single `Default` export that renders the composed parts. The file pair is named `<name>.component.stories.tsx` / `<name>.component.mdx` so it doesn't collide with the headless `Primitives` entry of the same title (e.g. `Dialog`, `Tabs` exist in both layers); the `docModules` map disambiguates by group.

### Archetype B — headless primitive (`Primitives`)

No styles, so there's no knob canvas. The single demo renders the primitive **raw (unstyled)** to show only behavior, state, and ARIA wiring. The prop/styling tables are **hand-written** (there's no CVA recipe to derive them). Required MDX section order:

```mdx
# Accordion

<!-- Intro: state plainly that it's a headless primitive that ships no styles, and
     that you target its `data-cl-*` attributes for appearance. -->

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

<!-- Table of the `data-cl-*` attributes each part emits, plus any exposed CSS
     custom properties (e.g. `--cl-accordion-panel-height`) with a CSS example. -->
```

The story is `meta` (no `styles`) plus a single `Default` export that renders the primitive unstyled. Don't add a `<Preview>` or `<PropTable>` — primitives have neither knobs nor a CVA recipe to drive them.

**Document the default value for every prop in a dedicated Default column.** Every props table — auto and hand-written — has a **Default** column; the `Type` stays a plain union/enum and the default is named in its own column (the convention every component-doc site and TypeDoc's `@default` tag follow), never inlined into the type. The auto `<PropTable>` renders `Prop | Type | Default | Value` and fills Default from the recipe's `_defaultVariants` (the **Value** column is the live knob seeded with that default); hand-written tables render `Prop | Type | Default | Description` and fill it by hand. Name the default member (`'base'`, `'multiple'`, `'bottom-start'`); use `—` when there is no default (a controlled-only or required prop) and append `(required)` for required props; when the default is behavioral rather than a literal, state it in words (`inherits Root`, `falls back to value`).

### Archetype C — composed layer (`AIO` / `Panels` / `Sections` / `Blocks`)

These compose lower layers, so the docs lead with the composition rather than knobs. Required MDX:

```mdx
import * as DeleteOrganizationStories from './delete-organization.stories';

# Delete Organization

<!-- One paragraph: what state this owns and which lower-layer pieces it wires together. -->

<Story
  name='Default'
  storyModule={DeleteOrganizationStories}
  composition={[
    { name: 'Destructive', href: '/blocks/destructive', layer: 'Blocks' },
    { name: 'Button', href: '/components/button', layer: 'Components' },
    { name: 'Input', href: '/components/input', layer: 'Components' },
    { name: 'Dialog', href: '/components/dialog', layer: 'Components' },
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
- [ ] Story renders (Emotion pragma present for styled components).
- [ ] MDX sections match the archetype's required order exactly.
- [ ] Every props-table row states its default in the **Default** column (auto `<PropTable>` fills it from `_defaultVariants`; `—` / `(required)` when none).
- [ ] Wiring done per `README.md`: `registry.ts`, `DocsViewer.tsx`'s `docModules`, and the `app/page.tsx` redirect if this is now the first component.
- [ ] `pnpm format --filter @clerk/swingset` is clean.
