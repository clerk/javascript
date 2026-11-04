---
name: studio
description: >-
  Author or tune a swingset studio showcase: the dev-only video stage in
  `packages/swingset/src/studio/` that records Mosaic components and code edits
  for social posts (component, code, and split layouts, the step list, the
  stand-in cursor, the capture route). Use when adding a showcase, framing a
  component on the stage, or changing the stage's layout, motion, or grid.
---

# Swingset studio

The studio is a dev-only stage for recording Mosaic showcases. It lives in swingset, never in
`@clerk/mosaic`, and swingset's middleware returns 404 for its routes outside `next dev`.

- `/template?showcase=<slug>`: the workbench. Pick a step from the list, force a layout with `1`/`2`/`3`, replay the cursor with `c`, toggle dark with `d` and the 8px grid with `g`.
- `/capture/<slug>`: the bare stage that plays the showcase, for recording.
- `src/studio/showcases/<slug>.tsx`: one showcase. Register it in `src/studio/showcases/index.ts`.
- `src/studio/ideas.json`: suggested showcases. Browse them with `studio-ideas`, update them with
  `studio-ideas-refresh`, and hand a finished recording to `studio-promote`.

A showcase is a `Showcase<State>` (`src/studio/types.ts`): a `View` that renders state, a `code(state)`
that prints the matching source, and `steps` that each set a layout, a partial state, and cursor
actions. Derive the code from state so the two never disagree. Set `file` to the path the snippet
would live at; the code panel shows it as a comment on the first line.

Print every prop the showcase changes, defaults included, one per line. A step then changes a value on
a line that was already there (`triggerVariant='full'` → `'condensed'`), so the diff reads as an edit
rather than a prop appearing or the whole tag being replaced.

Import Mosaic internals directly through the `@clerk/mosaic/*` source alias when the public exports
don't reach them (for example `@clerk/mosaic/features/switcher/switcher.view`).

## Frame a popover component by its expanded state

When the component opens a popover, menu, or any other popup from a trigger, frame the expanded
state, never the trigger:

- Set `focus: { width, height }` on the showcase to the size of the trigger plus its open popup.
- The stage centers that box, puts the trigger in its top-left corner, and draws the cell guide
  lines around it, so the popup opens into the middle of the panel and inside the guides.
- The box grows to fit the popup the first time it opens and keeps that size, so the guides always
  end up 8px outside it. Still set `focus` from the popup as rendered: open it in the workbench and
  copy the size it settles at. Otherwise the first open in a capture grows the box and shifts the
  frame.

Framed by the trigger, the stage re-centers when the popup opens and the guides cut through it.

## Cursor

A step's `cursor` actions are scripted: `{ at, target, click }` moves to `target` and clicks it,
`drag: '<selector>'` presses on `target` and drops on that selector, `park: true | { x, y }` nudges the
cursor off what it just clicked so the result is visible, and `hide` fades it out. After `hide`, or on
the first action, the cursor enters from below the frame.

- Moves into a menu, menubar, or listbox steer: nearly straight, never past the target, and landing
  near the row's vertical middle, so they don't brush the neighboring item. Force it either way with
  `steer: true | false`.
- `text: 'Label'` narrows `target` to the first match whose text starts with it, for controls that only
  differ by their label (`{ target: 'button', text: 'Settings' }`). Targets resolve in the component
  panel first, then anywhere on the stage.
- `scroll: 320` scrolls the nearest scrollable ancestor of `target` by that many pixels.
- `type: '284913'` types into whatever the click focused, one character at a time.
- A press also focuses the control, as a real mouse does, so focus-activated widgets (profile tabs)
  respond. Focus rings are hidden on the stage, since nothing in a capture uses the keyboard.

A dialog that should cover the whole stage portals into `StageOverlayContext` (from `Stage.tsx`) with
Mosaic's `PortalProvider`, not into the component panel. `user-profile-combined` is the example.

- Each move replays a recorded human path (`src/studio/cursor-paths.ts`), stretched onto the real start
  and end points, with its timing scaled by Fitts's law. With no recordings it falls back to a
  synthetic path. Every choice is seeded by showcase and step, so a capture is identical on every run.
- The cursor sends real pointer and mouse events (`over`/`enter`/`move`/`down`/`up`/`leave`) to whatever
  is under it. CSS `:hover` and `:active` can't be triggered from script, so `interactionStyles.ts`
  copies every such rule to `[data-studio-hover]`/`[data-studio-active]`, and the cursor sets those.
- To record paths, open `/recorder`, click through the dots (and drag in Drag mode) with the device
  whose feel you want, then **Copy cursor-paths.ts** and paste it over that file. Aim for 30 to 50 clicks
  of mixed distances and directions. Recordings persist in the browser until copied.

## Stage rules

- Spacing on the 8px grid: 24 from the frame lines for code and chrome text, code at 16/24, chrome at
  12/16, text trimmed to cap height. The logo block is the one element that ignores the grid.
- Motion: content leads and layout follows. Fade out, then move, then fade in, using Mosaic's easing
  tokens. See `packages/mosaic/docs/motion.md`.
