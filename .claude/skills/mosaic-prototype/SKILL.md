---
name: mosaic-prototype
description: >-
  Build a clickable prototype of a new Clerk UI idea in Swingset, from Mosaic
  components with a mocked model, so it can be shared and later shipped by
  writing only the real model. For anyone, including non-engineers.
disable-model-invocation: true
---

# Mosaic prototype

The goal is a working prototype on screen, fast. Someone clicks through it in
Swingset, gives feedback, and you change it. Speed and feel come first.

Do not write tests, chase lint, or polish edge cases while prototyping. Those
belong to whoever ships it. The one thing you keep from the real architecture is
the **model / controller / view split**, because that is what makes "only the
model is left" true.

## 1. Understand the idea

Ask the person, in plain words, and keep it short:

- What should someone see and do? Walk through it click by click.
- Who sees it? (Everyone signed in, admins only, members…)
- Where does it live? (Floating on the page, a new tab in User or Organization
  Profile, a new screen in a flow…)
- What can go wrong that they want to see? (Empty, error, no permission.)

Play it back as a short list of screens and states and get a yes. Don't ask
about anything you can find in the code.

## 2. Find the pieces before building

Look before you write. Most of what a prototype needs already exists.

- **Mosaic building blocks:** browse the Swingset sidebar
  (`packages/swingset/src/lib/registry.ts`), then look in `packages/mosaic/src/`
  before writing anything yourself:
  - `components/`: styled UI (Button, Field, Radio, Table, EmptyState, Card…).
  - `primitives/`: headless behavior and its hooks in `primitives/hooks/`
    (layout animation, panel sizing, formatted input…).
  - `blocks/`: ready-made pieces such as confirm and destructive dialogs.
  - `hooks/` and `utils/`: pending actions, debouncing, dates, errors.
  - `icons/glyphs/`: icons.
- **Shared helpers:** the "Reuse before you write" table in
  `packages/mosaic/AGENTS.md` says which of these fits which problem.
- **Existing features to compose:** `packages/mosaic/src/features/` (for
  example, `OrganizationProfileView` takes `customPages` for a new tab).
- **How the neighbours do it:** open the screens next to where yours lives and
  build the same kind of thing the same way. A list on a profile page is a
  `Table` with `renderEmptyState`, like the Members tabs; a form step uses
  `Field`, `Radio`, `Checkbox`, not custom cards.

If something is missing, tell the person in one line and pick the simplest
stand-in. Don't stop the prototype for it. Note it for the handoff: these gaps
are one of the most useful things a prototype finds.

## 3. Build it

Put the feature in `packages/mosaic/src/features/<name>/` and the mock in
Swingset. Follow the layer rules in `packages/mosaic/ARCHITECTURE.md`; for the
shape of each file, copy a nearby feature.

| File                                               | What goes in it                                                                                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<name>.types.ts`                                  | The model shape: `{ status: 'ready', …data, …callbacks } \| { status: 'hidden' }`. This is the contract the real model must meet.                             |
| `<name>.messages.ts`                               | All copy. Register it in `src/localization/registry.ts`.                                                                                                      |
| `<name>.styles.ts`                                 | StyleX styles. Never `stylex.create` in a `.tsx` file.                                                                                                        |
| `<name>.controller.ts`                             | Local state: open/closed, which step, `useForm`. Takes the model as an argument.                                                                              |
| `<name>.view.tsx`                                  | Renders props only.                                                                                                                                           |
| `packages/swingset/src/stories/fixtures/<name>.ts` | A hook that returns a fake model: seed data in `useState`, callbacks that wait ~800ms then update it, an option to fail. Wrap seed data in `useChaosFixture`. |
| `packages/swingset/src/stories/<name>.stories.tsx` | `meta` with `group: 'Prototypes'`, `status: 'wip'`, `substatus: 'needs wire-up'`, and one story per state.                                                    |
| `packages/swingset/src/stories/<name>.mdx`         | One paragraph on what it does, a `<Story>` per state, and a **To ship** section (see step 5).                                                                 |

Rules that keep it shippable:

- No Clerk imports in the controller or view. No `.model.ts` file. No export
  from the package `index`.
- The fixture is the only place with fake data.

Wire it into Swingset:

- `src/lib/registry.ts`: import the story exports, build a `StoryModule`, and add
  it at the end of the list under a `// Prototypes` comment (add the comment if
  this is the first prototype). **Add the import and its use in one edit**, or
  the on-save lint fix deletes the import.
- `src/components/DocsViewer.tsx`: add the MDX under `docModules.prototypes`,
  creating that key after `misc` if it doesn't exist yet.

## 4. Show it and iterate

Start Swingset once and leave it running:

```sh
pnpm run dev:swingset   # prints the port
```

Send the person the link (`/prototypes/<name>`) as soon as anything renders,
then change things as they react. Open your own browser tab to check; don't
drive theirs.

Gotchas that cost time:

- Combine `themeProps(...)` and `stylex.props(...)` with `mergeStyleProps`.
  Spreading both drops one `className`.
- Something `position: fixed` escapes the preview. Wrap the story in
  `style={{ position: 'relative', width: '100%', transform: 'translateZ(0)' }}`
  so it stays inside.
- Popovers and menus already handle placement, focus, and RTL. Use them before
  positioning anything by hand.
- A new icon is a glyph in `src/icons/glyphs/` plus a line in
  `src/icons/registry.tsx`.

## 5. Hand it off

When the person is happy, make it easy for an engineer to finish:

- Fill the MDX **To ship** section: each model type, what real Clerk data or
  call backs each field, who gets `hidden`, and any backend that doesn't exist yet.
- Add a **Gaps** section to the MDX. For each gap, say what was missing, what
  you used instead, and where it lives in the prototype. Group them:
  - **Components:** a styled part Mosaic doesn't have, or one missing a
    variant, size or slot you needed.
  - **Layout:** spacing, alignment or structure you had to hand-roll with a
    wrapper `div` or local styles, or a component that misbehaved in a layout
    (for example, a `fullWidth` Button collapsing inside a flex column).
  - **Primitives and hooks:** behavior you had to write or copy in, such as a
    gesture, focus handling or an animation.
  - **Copy:** text that needs review.
- Run `pnpm typecheck` in `packages/mosaic` and `pnpm format --filter @clerk/swingset`
  so the branch builds. Fix what they report; don't go further.
- If you added a shared hook or primitive under `src/primitives/` or `src/hooks/`,
  call it out: it needs tests and a row in the Mosaic reuse table before shipping.
- Add an empty changeset (`.changeset/<name>.md` with two `---` lines) and open
  a draft PR if asked, following `.github/PULL_REQUEST_TEMPLATE.md`.

Tests, lint, and accessibility review come when it ships, not here.
