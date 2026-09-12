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
  consumer's `className`/`style`.
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
before/afters: `packages/ui/src/mosaic/machine/ADOPTION.md`.

`references/mosaic-architecture.md` (repo root, read by all agents) is the
canonical contract for the whole design system — the `--cl-*` tokens, the
`.cl-<slot>` + `data-<axis>` styling API, the CSS build, and the "Flow and data
architecture" section that defines the split. Read it for the _what_; this skill
is the _how-to_.

`packages/ui/src/mosaic/user-button/` is the fullest worked example of the split
in the repo — model, controller, view, wrapper, types, messages, and a test per
layer. Copy from it.

## Which reference to read

| You are…                                                               | Read                                                   |
| ---------------------------------------------------------------------- | ------------------------------------------------------ |
| Building on / authoring a headless primitive (`@clerk/headless`)       | `references/headless.md`                               |
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
