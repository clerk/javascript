---
'@clerk/ui': minor
---

Add the Mosaic `Banner` component: a tinted surface that annotates the content around it with a status message. Compose it from `Banner.Root`, `Banner.Label`, and `Banner.Description`. `Banner.Root` takes a `color` of `neutral`, `warning`, or `negative`, and renders the icon for that color itself. It sets no ARIA role, so pass `role='status'` (or `role='alert'`) when the banner appears in response to something the user did.

Also adds an `info-circle` glyph to the Mosaic icon set.
