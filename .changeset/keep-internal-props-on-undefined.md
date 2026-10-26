---
'@clerk/mosaic': patch
---

Fix primitive parts dropping their own event handler, `className` or `style` when a consumer passes `undefined` for that prop. For example, `<Dialog.Trigger onClick={undefined}>` now still opens the dialog.
