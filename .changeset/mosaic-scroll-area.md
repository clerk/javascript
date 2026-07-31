---
'@clerk/ui': minor
---

Add a Mosaic scroll area: a scrolling region that fades its content at whichever edge still has something to reveal.

It ships as StyleX atoms rather than a component, because everything it does is CSS — a component would only add a DOM node and an API to version. `scrollAreaViewport(gutter?)` returns the atoms for the element that scrolls, and `scrollAreaRoot` styles a positioned ancestor for cases where an overlay has to anchor against the scroll box. The atoms bring no class of their own, so the element you apply them to keeps its existing `.cl-<slot>` class, and that stays the hook a theme targets.

```tsx
<Item.Group {...stylex.props(...scrollAreaViewport())}>{rows}</Item.Group>
```

The indicators are driven by scroll-driven animations — no scroll listener and no measurement. Because the fade is a mask rather than a sticky overlay element, it is paint-only and cannot shift the content. Browsers without scroll-driven animation support get a plain scroll area rather than a broken one, and a region with nothing to scroll shows no indicators at all.

`gutter` defaults to `auto`, matching CSS. Pass `stable` for a collection that can change height in place — a filterable list, a paginated table — so that crossing the overflow threshold doesn't shift its rows sideways.

The treatment is replaceable in plain CSS. Set `mask-image: none` on the element carrying the atoms to retire the default fade, and read `--cl-scroll-area-progress-start` / `--cl-scroll-area-progress-end` — per-element values the animations write, describing how much each edge still has to reveal — to drive a shadow or any other indicator.

Also adds four theme tokens that apply to every scrolling surface in Mosaic rather than to one component: `--cl-scroll-fade-size` and `--cl-scroll-fade-range` (both `1.5rem`) tune the fade's height and how far you scroll before it reaches full strength, `--cl-scroll-fade-inset` (`0px`) holds the fade back from a space-consuming scrollbar, and `--cl-scrollbar-width` (`thin`) sets the scrollbar size. Per the CSS spec that last one is keyword-only (`auto`, `thin`, or `none`) — `scrollbar-width` does not accept a length.
