---
name: mosaic
description: >-
  Work on Mosaic flow UI: authoring a state machine (`setup`, states/guards/`invoke`,
  wiring to React with `useMachine`/`useActor`/`useSelector`), writing the controller
  (Clerk adapter) or view (rendering) layer, or migrating a legacy / pre-Mosaic
  component into the machine / controller / view split and verifying no behavior is
  silently dropped. Use when building or debugging any Mosaic flow, or migrating a
  component into Mosaic. `references/mosaic-architecture.md` (repo root) holds the
  design-system contract; this skill is the how-to layer.
---

# Mosaic flow UI

Mosaic flow UI follows a **machine → controller → view** split. It keeps Clerk
resource logic out of visual components and makes most behavior testable without
a running Clerk app.

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
`data-cl-*` styling API, slot recipes, and the "Flow and data architecture"
section that defines this split. Read it for the _what_; this skill is the
_how-to_.

## Which reference to read

| You are…                                                           | Read                         |
| ------------------------------------------------------------------ | ---------------------------- |
| Authoring or debugging a state machine, or wiring one to React     | `references/machines.md`     |
| Writing the controller (Clerk adapter, permissions, revalidate)    | `references/controllers.md`  |
| Writing the view (rendering a snapshot, sending events)            | `references/views.md`        |
| Migrating a legacy component into Mosaic (the end-to-end workflow) | `references/migration.md`    |
| Running the parity audit that guards a migration                   | `references/parity-audit.md` |

The migration workflow (`migration.md`) ties the others together: it treats the
legacy component as the spec and drives you through the machine, controller, and
view layers, then verifies parity with `parity-audit.md`.
