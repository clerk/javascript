---
'@clerk/ui': minor
---

Add `ScrollArea` to Mosaic — a vertically scrolling region that fades its content at whichever edge still has something to reveal. Composed as `ScrollArea.Root` and `ScrollArea.Viewport`.

The indicators are pure CSS, driven by scroll-driven animations, and cost nothing at runtime. Because the fade is a mask rather than a sticky overlay element, it is paint-only and cannot shift the content. Browsers without scroll-driven animation support get a plain scroll area rather than a broken one.

`ScrollArea.Viewport` takes a `gutter` prop. The default, `auto`, takes the scrollbar's space only while the content overflows. Pass `stable` for a collection that can change height in place — a filterable list, a paginated table — so that crossing the overflow threshold doesn't shift its rows sideways.

The treatment is overridable in plain CSS, with no props involved. Set `mask-image: none` on `.cl-scroll-area-viewport` to retire the default fade, and read `--cl-scroll-area-progress-start` / `--cl-scroll-area-progress-end` — each running 0 → 1 as its edge gains something to reveal — to drive a shadow or any other indicator. `--cl-scroll-area-fade-size` and `--cl-scroll-area-fade-range` tune the built-in fade's height and how far you scroll before it reaches full strength.

Also adds a `--cl-scrollbar-width` theme token, defaulting to `thin`, which sets the scrollbar size for every scrolling surface in Mosaic at once. Per the CSS spec this is keyword-only (`auto`, `thin`, or `none`) — `scrollbar-width` does not accept a length.
