---
'@clerk/ui': minor
---

Add `ScrollArea` to Mosaic — a vertically scrolling region that fades its content at whichever edge still has something to reveal. Composed as `ScrollArea.Root` and `ScrollArea.Viewport`.

The indicators are pure CSS, driven by scroll-driven animations — no scroll listener and no measurement. Because the fade is a mask rather than a sticky overlay element, it is paint-only and cannot shift the content. Browsers without scroll-driven animation support get a plain scroll area rather than a broken one.

`ScrollArea.Viewport` manages its own `tabIndex` so consumers don't have to. Chrome and Firefox make an overflowing scroll container keyboard-focusable automatically and Safari does not, leaving a keyboard-only user there unable to scroll the region (WCAG 2.1.1); the viewport takes a tab stop exactly when those browsers would — when it overflows and its content holds nothing focusable — so a list of buttons or links, which is already reachable, doesn't gain a redundant stop. Pass an explicit `tabIndex` to override, or `-1` to opt out.

Both parts accept a `render` prop for polymorphism, so the region can carry its own semantics — `<ScrollArea.Viewport render={<ul />}>` for a list, for example. On the viewport the rendered element has to be able to establish a scroll box, since the overflow, mask and scroll timelines all apply to it.

`ScrollArea.Viewport` takes a `gutter` prop. The default, `auto`, takes the scrollbar's space only while the content overflows. Pass `stable` for a collection that can change height in place — a filterable list, a paginated table — so that crossing the overflow threshold doesn't shift its rows sideways.

The treatment is overridable in plain CSS, with no props involved. Set `mask-image: none` on `.cl-scroll-area-viewport` to retire the default fade, and read `--cl-scroll-area-progress-start` / `--cl-scroll-area-progress-end` — per-element values the animations write, describing how much each edge still has to reveal — to drive a shadow or any other indicator.

Also adds four theme tokens that apply to every scrolling surface in Mosaic rather than to this component alone: `--cl-scroll-fade-size` and `--cl-scroll-fade-range` (both `1.5rem`) tune the fade's height and how far you scroll before it reaches full strength, `--cl-scroll-fade-inset` (`0px`) holds the fade back from a space-consuming scrollbar, and `--cl-scrollbar-width` (`thin`) sets the scrollbar size. Per the CSS spec that last one is keyword-only (`auto`, `thin`, or `none`) — `scrollbar-width` does not accept a length.
