---
'@clerk/mosaic': patch
---

Fix elements passed from a React Server Component in development. A `render` element, such as `<Dialog.Trigger render={<Button />}>`, no longer renders as a plain unstyled element with a hydration mismatch, and an `icons` override on `MosaicProvider` no longer throws `Cannot read properties of undefined (reading 'className')`.
