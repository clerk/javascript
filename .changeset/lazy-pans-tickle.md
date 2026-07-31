---
'@clerk/ui': patch
---

Mosaic's scrolling surfaces now paint their own scrollbar, with a thumb that darkens on hover and again while you drag it. Previously the browser derived those states from `scrollbar-color` and got them backwards, lightening the thumb on hover.

New tokens, applied to every scrolling surface at once:

| Token                         | Default                    |
| ----------------------------- | -------------------------- |
| `--cl-scrollbar-thumb`        | `--cl-color-neutral-faded` |
| `--cl-scrollbar-thumb-hover`  | derived from the above     |
| `--cl-scrollbar-thumb-active` | derived from the above     |
| `--cl-scrollbar-thumb-inset`  | `0.1875rem`                |

Setting `--cl-scrollbar-thumb: transparent` gives a hover-reveal scrollbar: the thumb paints nothing at rest and fades in when you reach the region. The lane stays reserved either way, so nothing moves.

Two breaking notes if you were already theming these:

- `--cl-scrollbar-width` now takes a **length** (default `0.625rem`) rather than the `auto | thin | none` keyword. Use `0px` where you previously used `none`.
- `--cl-scroll-fade-inset` is removed. The mask now derives its inset from `--cl-scrollbar-width`, which closes the gap where the edge fade covered part of the scrollbar.

Firefox implements neither `::-webkit-scrollbar` nor an equivalent, so it keeps its platform scrollbar; touch platforms keep their native overlay bar as before. On macOS, styling the scrollbar takes it out of overlay mode, so the bar is always visible and always occupies its lane.
