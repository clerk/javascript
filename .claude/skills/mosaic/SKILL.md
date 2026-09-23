---
name: mosaic
description: >-
  Work on Mosaic UI: styling a component with StyleX (`stylex.create`, `--cl-*`
  tokens, `themeProps`), or building a flow — writing the model (the Clerk
  adapter), the controller (local state, in React state or a state machine:
  `setup`, states/guards/`invoke`, wired to React with `useMachine`/`useActor`/
  `useSelector`), or the view (rendering), testing any of those layers, or
  migrating a legacy / pre-Mosaic component into the model / controller / view
  split. Use when building, styling, debugging, testing, or migrating anything
  Mosaic. `references/mosaic-architecture.md` (repo root) holds the design-system
  contract; this skill is the how-to layer.
---

# Mosaic UI

Two things live under Mosaic, and this skill covers the how-to for both:

- **Styled components** are authored with **StyleX** — `stylex.create` declares
  the styles, `themeProps` emits the part's public identity (the `.cl-<slot>`
  class plus `data-<axis>` attrs), and `mergeStyleProps` fuses the two with the
  props the part was called with. A part takes `xstyle` (StyleX atoms for its
  root), never `className`/`style`.
- **Flows** follow a **model → controller → view** split — _where the data comes
  from_ → _what the user is doing to it_ → _what that looks like_. What crosses
  each boundary is plain data: no Clerk resource reaches the controller, no
  machine snapshot reaches the view.

```text
model       Clerk adapter: reads Clerk hooks and resources, resolves the
            environment, gates permissions, and answers with plain data plus
            plain callbacks under an explicit `status`. The only layer that may
            import Clerk hooks or call Clerk resource methods.

controller  Local state: what is open, what is in flight, what the view may do
            next — held in React state or a state machine, whichever the
            interaction's complexity calls for. Wraps the model's callbacks so
            an action can report pending, hold the surface still while it runs,
            and close on success. No Clerk imports.

view        Rendering: takes plain props and callbacks, renders UI, calls them
            back. No Clerk imports. No data-fetching. No machine snapshot.
```

A machine is **not a fourth layer**, and not a requirement. It is one of the two
ways a controller can hold its state, and picking one is a complexity call:
`useState` for a boolean that never touches async, a machine once the
interaction has an async lifecycle or two values that must change together, and
sometimes both in one controller. Either way the controller returns plain props,
so the view cannot tell and neither can its tests. Criteria and worked
before/afters: `packages/mosaic/src/machine/ADOPTION.md`.

`references/mosaic-architecture.md` (repo root, read by all agents) is the
canonical contract for the whole design system — the `--cl-*` tokens, the
`.cl-<slot>` + `data-<axis>` styling API, the CSS build, and the "Flow and data
architecture" section that defines the split. Read it for the _what_; this skill
is the _how-to_.

`packages/mosaic/src/features/user-button/` is the fullest worked example of the split
in the repo — model, controller, view, wrapper, types, messages, and a test per
layer. Copy from it.

## Which reference to read

| You are…                                                               | Read                                                   |
| ---------------------------------------------------------------------- | ------------------------------------------------------ |
| Building on / authoring a headless primitive (`src/primitives/`)       | `references/headless.md`                               |
| Styling a component (tokens, `stylex.create`, `themeProps`, CSS build) | `references/stylex.md`                                 |
| Building an enter/exit transition, or any motion that reads as wrong   | `references/motion.md`                                 |
| Writing the model (the Clerk adapter, `status`, permissions)           | `references/models.md`                                 |
| Writing the controller (local state, pending, action wrapping)         | `references/controllers.md`                            |
| Authoring or debugging a state machine, or wiring one to React         | `references/machines.md` → in-tree `machine/README.md` |
| Writing the view (rendering plain props)                               | `references/views.md`                                  |
| Testing a model, controller, or view                                   | `references/testing.md`                                |
| Migrating a legacy component into Mosaic (the end-to-end workflow)     | `references/migration.md`                              |
| Running the parity audit that guards a migration                       | `references/parity-audit.md`                           |

The migration workflow (`migration.md`) ties the flow references together: it
treats the legacy component as the spec and drives you through the model,
controller, and view layers, then verifies parity with `parity-audit.md`.

## Shaping a PR

- **Primitive first, styled component second.** A new component lands as a
  headless primitive PR, then a styled PR built on it (Toast: #9827 → #9850 →
  #9854; TagInput: #9838 → #9865). Model a new primitive on an established API
  such as Base UI or Floating UI rather than inventing one.
- **Small primitive changes ride along** with the styled PR under a "Primitive
  changes" heading in the description.
- **Describe the contract, not the work.** List the parts, keyboard behavior,
  accessibility, `data-*` attributes and CSS variables, and slot classes.
- **Name what is left out.** State the scope you cut ("swipe to dismiss is left
  out", "layout animation is a follow-up") so reviewers don't ask.
- **Keep PRs to one purpose.** A new prop, a build change, and a cleanup are
  three PRs. Consolidation of drifted duplicates gets its own PR.
- **Name compound parts consistently.** Parts that pair up follow one scheme:
  `Nav` / `NavItem` goes with `Content` / `ContentPanel`, not `TabPanel`.

## Documenting a component in swingset

`packages/swingset/CLAUDE.md` is the house style — archetypes, required section
order, `meta` conventions. One rule on top of it, because it is the one agents
get wrong:

**The docs describe the API as it is. They do not carry the reasoning that
produced it.** No "not a `size`, because…", no rejected alternatives, no history
of what the prop used to be. A reader is there to learn what the thing does, and
every sentence of rationale is a sentence they have to skim past to find it.
State the behaviour plainly and briefly, then stop.

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

The trade you rejected belongs in the PR description; the docs get the
conclusion.

## Rules reviewers keep flagging

These come up in review more than anything else. Check each one before opening a
PR.

- **Comments.** No JSDoc, no comment blocks. At most one terse `//` line, and
  only for a why the code cannot say (the cascade fight behind a `null`, the
  measured reason for a value). Rationale and rejected options go in the PR
  description. `custom-rules/mosaic-terse-comments` warns on violations.
- **Motion values are tokens.** Durations come from `durationVars`, easings from
  `easingVars`. `ease-out` is `--cl-ease-enter`, `ease-in` is `--cl-ease-exit`.
  Only `linear` and `0s` are written as literals. A few existing literals are
  deliberate; do not copy them into new code. `custom-rules/mosaic-motion-tokens`
  warns on violations. Details: `references/motion.md`.
- **Features don't style.** Styling lives in `components/`. Sections, panels,
  and flows under `features/` compose components and pass at most a small
  `xstyle` tweak. If a feature needs its own `stylex.create`, the component it
  uses is missing a variant or slot: add it to the component, or call it out in
  the PR. `custom-rules/mosaic-no-feature-styles` warns on violations.
- **Compose before you style.** Before styling a native element inside a
  component, check whether a Mosaic part already renders it with the right
  variant, and pass it through `render`. See "Compose existing parts" in
  `references/stylex.md`.
- **Changesets.** A change to a published `@clerk/mosaic` component takes a real
  changeset entry. A change that only touches new, unpublished components takes
  an empty one.
