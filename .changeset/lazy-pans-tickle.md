---
'@clerk/ui': patch
---

Mosaic's scrolling surfaces now paint their own scrollbar: a 4px pill that deepens while the pointer is on it and again while you drag it. Previously the browser derived those states from `scrollbar-color` and got them backwards, lightening the thumb on hover.

New tokens, applied to every scrolling surface at once:

| Token                         | Default                  |
| ----------------------------- | ------------------------ |
| `--cl-scrollbar-thumb`        | derived from the palette |
| `--cl-scrollbar-thumb-hover`  | derived from the above   |
| `--cl-scrollbar-thumb-active` | derived from the above   |
| `--cl-scrollbar-thumb-inset`  | `2px`                    |

Setting `--cl-scrollbar-thumb: transparent` hides the thumb without giving up its lane — it paints only while the pointer is on it, and nothing moves either way.

Two breaking notes if you were already theming these:

- `--cl-scrollbar-width` now takes a **length** (default `8px`) rather than the `auto | thin | none` keyword. Use `0px` where you previously used `none`.
- `--cl-scroll-fade-inset` is removed. The mask now derives its inset from `--cl-scrollbar-width`, which closes the gap where the edge fade covered part of the scrollbar.

Firefox implements neither `::-webkit-scrollbar` nor an equivalent, so it keeps its platform scrollbar; touch platforms keep their native overlay bar as before. On macOS, styling the scrollbar takes it out of overlay mode, so the bar is always visible and always occupies its lane.
