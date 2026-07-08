---
name: mosaic
description: >-
  Work on Mosaic UI: styling a component with slot recipes (`defineSlotRecipe` /
  `useRecipe` / slots / variants), or building a flow — authoring a state machine
  (`setup`, states/guards/`invoke`, wiring to React with `useMachine`/`useActor`/
  `useSelector`), writing the controller (Clerk adapter) or view (rendering) layer,
  testing any of those layers, or migrating a legacy / pre-Mosaic component into the
  machine / controller / view split. Use when building, styling, debugging, testing, or
  migrating anything Mosaic. `references/mosaic-architecture.md` (repo root) holds the
  design-system contract; this skill is the how-to layer.
---

# Mosaic UI

Two things live under Mosaic, and this skill covers the how-to for both:

- **Styled components** are authored with **slot recipes** — one recipe owns a
  part's slot identity (`data-cl-slot`), variants, state, and appearance
  cascade; `useRecipe` resolves it and hands back per-slot props to spread.
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
canonical contract for the whole design system — tokens, theme delivery, the
`data-cl-*` styling API, slot recipes, appearance/cascade/scope, and the "Flow
and data architecture" section that defines the split. Read it for the _what_;
this skill is the _how-to_.

## Which reference to read

| You are…                                                           | Read                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------ |
| Styling a component (slot recipes, `useRecipe`, variants, slots)   | `references/styling.md`                                |
| Authoring or debugging a state machine, or wiring one to React     | `references/machines.md` → in-tree `machine/README.md` |
| Writing the controller (Clerk adapter, permissions, revalidate)    | `references/controllers.md`                            |
| Writing the view (rendering a snapshot, sending events)            | `references/views.md`                                  |
| Testing a machine, controller, or view                             | `references/testing.md`                                |
| Migrating a legacy component into Mosaic (the end-to-end workflow) | `references/migration.md`                              |
| Running the parity audit that guards a migration                   | `references/parity-audit.md`                           |

The migration workflow (`migration.md`) ties the flow references together: it
treats the legacy component as the spec and drives you through the machine,
controller, and view layers, then verifies parity with `parity-audit.md`.
