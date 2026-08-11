---
'@clerk/headless': patch
'@clerk/ui': patch
---

Add Base UI–style composition APIs to the Dialog, in both the headless primitive and the Mosaic component.

**Detached triggers.** `Dialog.createHandle()` returns a handle; pass the same handle to a `Dialog.Trigger` and a `Dialog.Root`, and the trigger drives the dialog from anywhere in the tree — no JSX nesting required. The handle also has imperative `open()` / `close()` / `isOpen` members; calls made while no root is mounted are ignored.

**Multiple triggers and payloads.** Several triggers can share one dialog. Each can carry an `id` and a `payload`, and the root's children can be a function receiving `{ payload }` from the active trigger, so one dialog renders per-trigger content. Type the payload through the handle: `Dialog.createHandle<Payload>()`. Everything keyed to "the trigger" now follows the one actually used: the dialog returns focus to it on close. In controlled mode, `triggerId` on `Dialog.Root` names the active trigger, and `onOpenChange` gains a second `details` argument (`{ trigger, triggerId, event }`) reporting the trigger behind each change — existing single-argument callbacks are unaffected.

**Custom focus management.** `initialFocus` and `finalFocus` on `Dialog.Popup` control where focus moves on open and close. Each accepts `true` (the default behaviour), `false` (do not move focus), a ref, or a function of the interaction type behind the change (`'mouse' | 'touch' | 'pen' | 'keyboard' | ''`, empty when programmatic) returning any of those. Defaults are unchanged: first tabbable on open; the trigger on close, except after a pointer-driven dismissal, where focus stays where the pointer put it.
