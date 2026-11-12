# Documenting components

Read this when you add or change a Swingset page for a Mosaic component, block, hook or style: a `<name>.stories.tsx` or `<name>.mdx` in `packages/swingset/src/stories/`. It covers what to write once the page is wired; how the app works is in `packages/swingset/CLAUDE.md`, and the registry, `docModules` and redirect wiring is in `packages/swingset/README.md`.

Worked examples: `button.stories.tsx` and `button.mdx` (archetype A, simple), `popover.component.mdx` (A, compound), `accordion.mdx` (B), `user-button.mdx` (C).

## Rules

- A page is a `<name>.stories.tsx` (a `meta`, plus named `export function` stories where the archetype has them; the code footer extracts only function declarations) and a `<name>.mdx`. The archetype decides which stories the file exports and which of `<Preview>`, `<PropTable>`, `<Usage>` and `<Story>` the page uses.
- Pick the archetype by the entry's layer (`meta.group`) and follow its section order exactly. Same archetype, same headings in the same order: that uniformity is the point.
- Always set `meta.source`, as a repo-root-relative path to the file that exports the component.
- Every props table has a **Default** column ([Document the default value](#document-the-default-value)).
- Prose adds what a demo cannot (behavior, accessibility, when to reach for it) and states the API as it is, without rationale or history ([Writing the prose](#writing-the-prose)).
- Import the component explicitly, never with `import *`.

## Layers

`meta.group` places an entry in one of these layers; how the sidebar orders groups and `meta.navigation.category` subheadings is in `packages/swingset/src/lib/registry.ts`. Use these exact group strings:

| Group                  | What lives here                                                                                                                      | Archetype   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `User Button`          | Composed flow UI (e.g. `UserButton`)                                                                                                 | C           |
| `User Profile`         | Composed flow UI (e.g. `UserProfileProfilePanel`)                                                                                    | C           |
| `Organization Profile` | Composed flow UI (e.g. `OrganizationProfileGeneralPanel`)                                                                            | C           |
| `Misc`                 | Standalone composed components (e.g. `OrganizationSwitcher`, `Waitlist`)                                                             | C           |
| `Authentication`       | Flow views built from steps (e.g. `SignIn`)                                                                                          | C · flow    |
| `Blocks`               | Flows assembled from components, wired by the caller's machine (e.g. `Confirmation`, `Destructive`)                                  | C           |
| `Components`           | Styled Mosaic components — simple, with a flat variant surface (`Button`, `Input`), or compound (`Card`, `Field`, `Menu`, `Popover`) | A           |
| `Primitives`           | Headless primitives from `@clerk/mosaic`'s `src/primitives/` (`Accordion`)                                                           | B           |
| `Styles`               | Atomic styles that ship as StyleX atoms, not components (`Scroll Area`)                                                              | B (adapted) |
| `Hooks`                | Headless hooks (`useForm`)                                                                                                           | B (adapted) |
| `Localization`         | The `localization` prop on `MosaicProvider`: catalogs, overrides, locale, and the message helpers                                    | B (adapted) |

`User Button` / `User Profile` / `Organization Profile` / `Misc` / `Blocks` → `Components` → `Primitives` runs high-level-composition → low-level-primitive. Composed layers are documented as compositions of lower layers (archetype C); leaf layers (Components, Primitives) get full prop/knob docs (archetypes A and B).

`Styles` and `Hooks` are the non-component layers: there is no element to knob, so they follow
archetype B's shape (Example → Usage → Parts → Styling) with `Props` replaced by whatever the export
actually surfaces — an argument table for a style function, a return-value table for a hook. A
`Styles` entry documents the tokens its atoms read, since those tokens _are_ its API; a
`Hooks` entry needs only `meta`, with no story exports at all, which is the minimum a section entry
needs.

## `meta` conventions (all archetypes)

```ts
export const meta: StoryMeta = {
  group: 'Components', // exact group string from the table
  title: 'Button', // drives slug + the page <h1>
  label: 'Delete Org', // optional friendlier sidebar text
  status: 'stable', // maturity dot in sidebar + page badge; omit to show no status
  source: 'packages/mosaic/src/components/button/button.tsx', // repo-root path → "View source"
  styles: {
    // Hand-written variant surface — archetype A · simple only
    _variants: { variant: { primary: {}, outline: {} }, size: { sm: {}, md: {} } },
    _defaultVariants: { variant: 'primary', size: 'md' },
  },
};
```

- `title` is the component's export name; it produces the slug and is what readers match against code. Set `label` only when the sidebar should read differently (the slug and page heading still come from `title`).
- `status` is `'stable'`, `'wip'` or `'todo'` (planned, not yet built), shown as a dot in the sidebar and a badge on the page. Omit it to show no status. A todo entry is `meta` plus a one-paragraph MDX page, and skips its archetype's sections and `source` until the component exists.
- `substatus` optionally says why a wip entry is wip, as a `WipSubstatus` value (`packages/swingset/src/lib/types.ts`).
- `styles` declares the component's variant props and is **required for archetype A's simple (knob-driven) form** (it generates the knobs and the `<PropTable>`). Keep it in sync with the component's real prop union by hand — StyleX compiles its styles away, so nothing derives it for you. Omit it for compound A components, and for B and C.

## Archetype A — styled component (`Components`)

A styled Mosaic component. Which of the two forms below applies is decided by the component's shape, not by preference: if it exposes a single flat set of variant props (declared as `meta.styles`), use the **simple** form; if it's compound — a set of parts with no flat variant props (`Card`, `Field`, `Menu`, `Popover`) — use the **compound** form.

**Every `Components`-layer story file exposes its source so each `<Story>` example renders a code footer.** Add the self-import once, right after the imports:

```ts
export { default as __source } from './<name>.stories?raw';
```

`StoryEmbed` picks it up and renders a "View code" footer for each `<Story>`; no MDX change is needed. This applies to both A forms.

### A · simple — flat variant props (`Button`, `Input`)

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
  module='@clerk/mosaic/components/button'
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
- Use `<PropTable>`'s `extra` for documenting non-variant props; the `xstyle` escape-hatch row is appended for you.
- Use `<Usage props={{…}}>` to pin static, non-knob props in the generated snippet.

### A · compound — parts, no flat variant props (`Card`, `Field`, `Menu`, `Popover`)

A compound styled component (`Popover.Root`/`Popover.Popup`/…) has no single flat prop interface to knob, so there's no `<Preview>` or `<PropTable>`. Document it like a primitive (archetype B) but themed — the difference is the **Styling** section, which lists each part's `.cl-<slot>` class and `data-<axis>` attributes rather than saying "bring your own CSS". Required MDX section order:

```mdx
import * as PopoverStories from './popover.component.stories';

# Popover

<!-- Intro: state it's the styled Mosaic component built on the underlying headless
     primitive, and that it inherits the primitive's behavior/ARIA. -->

## Example

<Story
  name='Default'
  storyModule={PopoverStories}
/>

## Usage

<!-- A code fence showing the compound parts composed together. -->

## Parts

<!-- Table: part | class (`.cl-<slot>`) | description. -->

## Styling

<!-- Each part's `.cl-<slot>` class and the `data-<axis>` attributes it reflects, plus
     the `--cl-*` tokens it reads, with a CSS example. -->
```

The story is `meta` (no `styles`) plus a single `Default` export that renders the composed parts. The file pair is named `<name>.component.stories.tsx` / `<name>.component.mdx` so it doesn't collide with the headless `Primitives` entry of the same title (e.g. `Menu`, `Popover` exist in both layers); the `docModules` map disambiguates by group.

## Archetype B — headless primitive (`Primitives`)

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

### Document the default value

Every props table has a **Default** column, and the `Type` stays a plain union, never with the default inlined. The auto `<PropTable>` fills it from `meta.styles._defaultVariants`; hand-written tables (`Prop | Type | Default | Description`) fill it by hand. Name the default member (`'bottom-start'`), use `—` when there is none and append `(required)` for a required prop, and state a behavioral default in words (`inherits Root`).

## Archetype C — composed layer (`User Button`, `User Profile`, `Organization Profile`, `Misc`, `Blocks`, `Authentication`)

These compose lower layers, so the docs lead with the composition rather than knobs. Required MDX:

```mdx
import * as SwitcherStories from './user-button.stories';

# UserButton

<!-- One paragraph: what state this owns and which lower-layer pieces it wires together. -->

<Story
  name='Default'
  storyModule={SwitcherStories}
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

### C · flow — a view built from steps (`Authentication`)

A flow view shows one step at a time, so a single `Default` cannot show every screen. The page adds `Usage` and one section per step component after the composition. Required MDX section order:

```mdx
import * as Stories from './sign-in.stories';

# SignIn

<!-- One paragraph: what the working example does and which inputs reach which branches. -->

## Example

<Story
  name='Default'
  storyModule={Stories}
  composition={[{ name: 'Card', href: '/components/card', layer: 'Components' }]}
/>

## Usage

<!-- What the view owns, how `step` picks the screen, and a code fence rendering the view. -->

## Steps

<!-- One sentence on how the sections map to step components, and that a red box marks a planned view. -->

### Identifier step

<!-- One line naming the step file and the step values it draws. -->

#### Default

<Story
  name='IdentifierDefault'
  storyModule={Stories}
/>
```

- `Default` is a working example: plain props driven by a stand-in for the controller, so the whole flow can be clicked through.
- Under `## Steps`, each `###` is one component in the feature's `steps/` folder, and each `####` is one step value it draws. Each example is one story export, named for the step and the example (`IdentifierDefault`, `CredentialPasswordError`).
- A view the legacy component has and Mosaic does not yet gets its `####` and a `<Story>` naming the export it will have. Swingset renders a red "not found" box for a story the file does not export, which marks the gap on the page. Exporting the story turns the box into the example, with no MDX change.

## Writing the prose

- Keep the intro to one short, present-tense paragraph: what the thing is and what it's for. For primitives, say it is headless and ships no styles.
- Do not restate prop names already in the table.
- Leave out the reasoning behind the API: no "not a `size`, because…", no rejected alternatives, no history. That belongs in the PR description.

```mdx
<!-- no -->

### Variant

Which surface the dialog holds, and so the geometry it is given. Not a `size`,
because these are different surfaces rather than one surface at two widths — a
second card width would be a size of the `card` variant, with nowhere to sit on
this axis.

<!-- yes -->

### Variant

Which surface the dialog holds, and the geometry that comes with it.
```

## Before you finish

- [ ] `meta.source` is set to a repo-root-relative path.
- [ ] Story renders.
- [ ] `Components`-layer story files export `__source` (the `?raw` self-import) so every `<Story>` example gets a "View code" footer.
- [ ] MDX sections match the archetype's required order exactly.
- [ ] Every props-table row states its default in the **Default** column.
- [ ] Wiring done per `packages/swingset/README.md`: `registry.ts`, `DocsViewer.tsx`'s `docModules`, and the `app/(explorer)/page.tsx` redirect if this is now the first component.
- [ ] Every story added, renamed or removed is changed in `registry.ts` too. It imports each story by name, so an import of a story that no longer exists fails the whole page.
- [ ] `pnpm format --filter @clerk/swingset` is clean.
