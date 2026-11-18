---
'@clerk/mosaic': minor
---

**Breaking:** `CopyButton` now confirms a copy in a tooltip instead of a toast, the way the Dashboard's copy trigger does. Hovering or focusing the button shows its `label` after 300ms, a copy swaps that tooltip to `copiedLabel` with a check that draws in, copying again restarts the confirmation, leaving the button closes it, and only one copy button shows a confirmation at a time. The button keeps its name, and the confirmation is announced through a visually hidden status region. Props and callbacks are unchanged; the styling hooks are replaced.

| Before | After |
| --- | --- |
| `.cl-copy-button-toast` | `.cl-copy-button-copied` (inside `.cl-tooltip-popup`) |
| `.cl-copy-button-toast-title` | removed; the confirmation text is the content of `.cl-copy-button-copied` |
| n/a | `.cl-copy-button-label` (the hover tooltip text) |

Find usages with `git grep -n "copy-button-toast"`.
