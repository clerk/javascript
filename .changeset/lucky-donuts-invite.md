---
'@clerk/ui': patch
---

Add a `closedBy` prop to the Mosaic `Dialog`, controlling which gestures dismiss it: `any` (Escape and outside press, the default), `closerequest` (Escape only), or `none` (neither — the dialog closes only programmatically). Use `closerequest` for dialogs holding user input so a stray backdrop click cannot discard it.

The `trigger` prop is now optional, so a dialog driven entirely by `open` no longer has to render a trigger button it does not need.
