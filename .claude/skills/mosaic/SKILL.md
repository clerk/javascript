---
name: mosaic
description: >-
  Work on Mosaic UI: styling a component with StyleX (`stylex.create`, `--cl-*`
  tokens, `themeProps`), or building a flow — writing the model (the Clerk
  adapter), the controller (local state, in React state or a state machine:
  `setup`, states/guards/`invoke`, wired to React with `useMachine`/`useActor`/
  `useSelector`), or the view (rendering), testing a feature, or
  migrating a legacy / pre-Mosaic component into the model / controller / view
  split. Use when building, styling, debugging, testing, or migrating anything
  Mosaic. `packages/mosaic/ARCHITECTURE.md` holds the design-system
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

`packages/mosaic/ARCHITECTURE.md` is the
canonical contract for the whole design system — the `--cl-*` tokens, the
`.cl-<slot>` + `data-<axis>` styling API, the CSS build, and the "Flow and data
architecture" section that defines the split. Read it for the _what_; this skill
is the _how-to_.

`packages/mosaic/src/features/user-button/` is the fullest worked example of the split
in the repo — model, controller, view, wrapper, types, messages, and a feature
test. Copy from it. Its feature test sits in `__tests__/` because it predates
colocating tests (`packages/mosaic/docs/testing.md`).

`packages/mosaic/AGENTS.md` loads for any work in the package. It maps common
problems (errors, pending state, focus after removal, debouncing, confirm steps)
to the shared helper that already solves them, and says to ask the user before
adding a new pattern. Check it before writing any of those by hand.

## Which reference to read

Use the "Task guides" table in `packages/mosaic/AGENTS.md`. It is the shared
task index for agents, including those that do not discover this skill. Read
the guide for the layer or behavior you are changing.

The migration workflow (`packages/mosaic/docs/migration.md`) ties the flow references together: it
treats the legacy component as the spec and drives you through the model,
controller, and view layers, then verifies parity with `parity-audit.md`.

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

Follow the root `AGENTS.md` rule for code comments. Put implementation rationale
and rejected alternatives in the PR description. Component docs describe the
resulting API.
