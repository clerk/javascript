---
'@clerk/mosaic': patch
---

Fix a `render` element written in a React Server Component, such as `<Dialog.Trigger render={<Button />}>`, rendering as a plain unstyled element on the client and causing a hydration mismatch.
