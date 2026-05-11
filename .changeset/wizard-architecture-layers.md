---
'@clerk/ui': patch
---

Refactor `<__experimental_ConfigureSSO />` into a layered primitive set: a state-driven Wizard, a UI-only Stepper, a `Step` compound, and ProfileCard chrome. No public component API change. Drops the central FooterActionsContext registry — each step now renders its own footer via `Step.Footer.Previous` / `Step.Footer.Continue` purely-presentational compounds. Adds a SelectProviderStep boilerplate filtered out of the breadcrumb.
