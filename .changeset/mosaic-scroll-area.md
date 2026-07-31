---
'@clerk/ui': minor
---

Add `ScrollArea` to Mosaic — a vertically scrolling region that fades its content at whichever edge still has something to reveal. Composed as `ScrollArea.Root` and `ScrollArea.Viewport`.

The indicators are pure CSS, driven by scroll-driven animations, and cost nothing at runtime. Because the fade is a mask rather than a sticky overlay element, it is paint-only and cannot shift the content. Browsers without scroll-driven animation support get a plain scroll area rather than a broken one.

`ScrollArea.Viewport` takes a `gutter` prop. The default, `auto`, takes the scrollbar's space only while the content overflows. Pass `stable` for a collection that can change height in place — a filterable list, a paginated table — so that crossing the overflow threshold doesn't shift its rows sideways.

The treatment is overridable in plain CSS, with no props involved. Set `mask-image: none` on `.cl-scroll-area-viewport` to retire the default fade, and read `--cl-scroll-area-progress-start` / `--cl-scroll-area-progress-end` — per-element values the animations write, describing how much each edge still has to reveal — to drive a shadow or any other indicator.

Also adds four theme tokens that apply to every scrolling surface in Mosaic rather than to this component alone: `--cl-scroll-fade-size` and `--cl-scroll-fade-range` (both `1.5rem`) tune the fade's height and how far you scroll before it reaches full strength, `--cl-scroll-fade-inset` (`0px`) holds the fade back from a space-consuming scrollbar, and `--cl-scrollbar-width` (`thin`) sets the scrollbar size. Per the CSS spec that last one is keyword-only (`auto`, `thin`, or `none`) — `scrollbar-width` does not accept a length.
