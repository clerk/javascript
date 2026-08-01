---
'@clerk/ui': patch
---

Mosaic's scrolling surfaces now paint their own scrollbar: a 4px pill that deepens while the pointer is on it and again while you drag it. Previously the browser derived those states from `scrollbar-color` and got them backwards, lightening the thumb on hover.

New tokens, applied to every scrolling surface at once:

| Token                         | Default                  |
| ----------------------------- | ------------------------ |
| `--cl-scrollbar-thumb`        | derived from the palette |
| `--cl-scrollbar-thumb-idle`   | derived from the above   |
| `--cl-scrollbar-thumb-hover`  | derived from the above   |
| `--cl-scrollbar-thumb-active` | derived from the above   |
| `--cl-scrollbar-thumb-inset`  | `2px`                    |
| `--cl-scrollbar-thumb-offset` | `1px`                    |

The colours are four states running quietest to loudest: `idle` while the pointer is elsewhere, the base once it reaches the region, then `hover` and `active` for the thumb's own two. `--cl-scrollbar-thumb-idle: oklch(from var(--cl-scrollbar-thumb) l c h / 0)` is the whole recipe for a scrollbar that fades in on approach and gives up no layout doing it.

`--cl-scrollbar-thumb-offset` shifts the thumb toward the content without resizing it. The lane itself can't be moved — the browser places it at the inline end of the padding box and it takes no margin, offset, or transform — so this adds to the inset on one side and takes it off the other.

Two breaking notes if you were already theming these:

- `--cl-scrollbar-width` now takes a **length** (default `8px`) rather than the `auto | thin | none` keyword. Use `0px` where you previously used `none`.
- `--cl-scroll-fade-inset` is removed. The mask now derives its inset from `--cl-scrollbar-width`, which closes the gap where the edge fade covered part of the scrollbar.

Firefox implements neither `::-webkit-scrollbar` nor an equivalent, so it keeps its platform scrollbar; touch platforms keep their native overlay bar as before. On macOS, styling the scrollbar takes it out of overlay mode, so the bar is always visible and always occupies its lane.

The thumb's `hover` and `active` colours switch instantly rather than fading. Blink runs no transition declared on `::-webkit-scrollbar-thumb`, so the transition lives on the scroller and the thumb inherits the animating value — meaning a change made on the scroller fades, while one made on the thumb itself can only snap. Retargeting `--cl-scrollbar-thumb` from a region's own `:hover` (to fade a scrollbar in) does transition.
