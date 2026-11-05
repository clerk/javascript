# Skeletons

Read this when you add or change a `*.skeleton.tsx`, a loading state, or a `Skeleton` wrapper. It covers what becomes a bone, how a skeleton is built, sized and swapped, and the shimmer; a single action in flight is a pending button, covered in [Controllers](controllers.md).

Worked example: `src/features/user-profile/user-profile-active-devices-section/`.

## Rules

- Only fetched content becomes bones. Titles, headings, column headers and other text known before the fetch stay real text, so the user can see what is loading.
- A skeleton has the exact size of the content it replaces, so the swap never shifts layout. Measure it.
- A skeleton is its own `<feature>.skeleton.tsx`, built from the same components as the view. The view has no skeleton code, and neither does any component: wrap content in `Skeleton` (`src/components/skeleton/`).
- The component that owns the loading state swaps skeleton and view. `fallback` is only for while Clerk loads; a section's own data loading uses its skeleton, and callers pass nothing for it.
- No data is not loading. When the fetch returns nothing, render `EmptyState`; never leave a skeleton up as an empty state or as decoration.
- A skeleton holds no working controls. Wrapped content is hidden, rows are `aria-hidden`, and a control kept for its size is `disabled`.

## What to render as bones

Content that is not being fetched keeps rendering. A section loaded by a later request shows its skeleton beside sections that have loaded, and a table moving to another page turns its rows into bones while its headers and controls stay. Whether a table's controls are bones on first load is still open.

Row actions in a section (menus, buttons) are wrapped with `visible={false}`: they keep their space, so the row holds its height, but no bone is drawn.

## Building one

The active devices section returns `<UserProfileActiveDevicesSectionSkeleton />` while its model is `loadingDevices`, and `<UserProfileActiveDevicesSectionView />` once it is ready.

- **`Skeleton` always shows unless `show` is `false`**, as in `<Panel.Title><Skeleton show={loading}>…</Skeleton></Panel.Title>` for content that stays mounted.
- **What it draws.** String children become a pill bar: one line, cap height, on the text's baseline, as wide as the text. Element children become a block the size of the element, which stays in the layout hidden. Wrap the text for a bar; wrap its parent element to cover several lines with one block.
- **Shapes are semantic.** `rounded` (the default, `--cl-radius-md`) for media, icon frames and buttons; `pill` (`--cl-radius-full`) for avatars and round controls; `square` (`--cl-radius-none`) for image tiles. Text bars are always pills. Pick the shape of the element being replaced.
- **`visible={false}`** keeps the space without drawing a bone. **`width` and `height`** size a skeleton with no children; with children, the size comes from them.
- **Placeholder data decides row count, shape and text length.** Write placeholder strings at a typical length, one line each, since bars do not wrap. Aim at the most common loaded shape: 2 or 3 rows, every line present, and the branch real data usually takes (a current device, not the empty state). When the count is known before the fetch, use it: a table paging with a known total shows exactly `min(pageSize, total − offset)` rows. A first load or a new search cannot know, so it uses the typical count and accepts a shift. The page size is a maximum, not a count.
- **Announce it.** The skeleton renders a `VisuallyHidden` `role='status'` message ("Loading active devices"), and the view renders its own ("Active devices loaded").
- **A component's own loading state** that is not a skeleton, such as `Avatar.Fallback` while an image loads, takes `skeletonStyles.shimmer` from `src/styles/skeleton.styles.ts` for the same highlight.

## Sizing and shimmer

A text bar sits in one line of its parent's type and a block is its element's own size, so wrapped content keeps its height by construction. A placeholder string longer than the real content is the usual cause of a shift.

The shimmer is CSS only, modeled on React Spectrum's `Skeleton`, and off under reduced motion (`src/styles/skeleton.styles.ts` holds the geometry and timing). Bones are not synced: a section that mounts later sweeps out of step, which is expected.

## When to show it

The component that owns the loading state shows the skeleton for as long as the data is loading. The planned gate is `useSpinDelay(loading || null, { delay: 150, minDuration: 500 }) !== null`, with the skeleton mounted but `visibility: hidden` until the delay passes, so a fast load never flashes it and nothing shifts when it appears.

## Testing

- Add a Swingset **Loading** story with a **Reload** button that fakes a load (`section.stories.tsx` → `Loading`).
- Measure, don't eyeball: compare each row's and card's `getBoundingClientRect().height` in the skeleton and loaded states ([verify-mosaic](../.claude/skills/verify-mosaic/SKILL.md)). They must be equal, except where the number of rows differs.
- Clear Swingset's `.next` after any `*.styles.ts` edit.
