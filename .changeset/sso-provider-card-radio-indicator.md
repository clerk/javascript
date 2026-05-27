---
"@clerk/ui": patch
---

Add a visible radio indicator to each provider card on the `<ConfigureSSO />` Select Provider step. Extends the internal `SimpleButton` primitive with a polymorphic `as` prop (`'button'` by default, `'label'` opt-in) so the card wrapper reuses the shared outline-button styling instead of duplicating it inline.
