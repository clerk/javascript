---
name: mosaic
description: >-
  Work on Mosaic UI: styling a component with StyleX (`stylex.create`, `--cl-*`
  tokens, `themeProps`), or building a flow — authoring a state machine
  (`setup`, states/guards/`invoke`, wiring to React with `useMachine`/`useActor`/
  `useSelector`), writing the controller (Clerk adapter) or view (rendering) layer,
  testing any of those layers, or migrating a legacy / pre-Mosaic component into the
  machine / controller / view split. Use when building, styling, debugging, testing, or
  migrating anything Mosaic. `references/mosaic-architecture.md` (repo root) holds the
  design-system contract; this skill is the how-to layer.
---

# Mosaic UI

Two things live under Mosaic, and this skill covers the how-to for both:

- **Styled components** are authored with **StyleX** — `stylex.create` declares
  the styles, `themeProps` emits the part's public identity (the `.cl-<slot>`
  class plus `data-<axis>` attrs), and `mergeStyleProps` fuses the two with the
  consumer's `className`/`style`.
- **Flows** follow a **machine → controller → view** split that keeps Clerk
  resource logic out of visual components and makes behavior testable without a
  running Clerk app:

```text
machine     Pure flow rules: states, events, guards, async invokes, errors.
            No React hooks. No Clerk hooks. No Clerk resource objects.

controller  Clerk/data adapter: reads Clerk hooks/resources, injects async
            effects into machine context, gates permissions, derives view props.
            The only layer that may import Clerk hooks or call resource methods.

view        Rendering only: receives a snapshot plus explicit props, renders UI,
            sends events. No Clerk imports. No data-fetching. No mutations.
```

`references/mosaic-architecture.md` (repo root, read by all agents) is the
canonical contract for the whole design system — the `--cl-*` tokens, the
`.cl-<slot>` + `data-<axis>` styling API, the CSS build, and the "Flow and data
architecture" section that defines the split. Read it for the _what_; this skill
is the _how-to_.

## Which reference to read

| You are…                                                               | Read                                                   |
| ---------------------------------------------------------------------- | ------------------------------------------------------ |
| Building on / authoring a headless primitive (`@clerk/headless`)       | `references/headless.md`                               |
| Styling a component (tokens, `stylex.create`, `themeProps`, CSS build) | `references/stylex.md`                                 |
| Building an enter/exit transition, or any motion that reads as wrong   | `references/motion.md`                                 |
| Authoring or debugging a state machine, or wiring one to React         | `references/machines.md` → in-tree `machine/README.md` |
| Writing the controller (Clerk adapter, permissions, revalidate)        | `references/controllers.md`                            |
| Writing the view (rendering a snapshot, sending events)                | `references/views.md`                                  |
| Testing a machine, controller, or view                                 | `references/testing.md`                                |
| Migrating a legacy component into Mosaic (the end-to-end workflow)     | `references/migration.md`                              |
| Running the parity audit that guards a migration                       | `references/parity-audit.md`                           |

The migration workflow (`migration.md`) ties the flow references together: it
treats the legacy component as the spec and drives you through the machine,
controller, and view layers, then verifies parity with `parity-audit.md`.
