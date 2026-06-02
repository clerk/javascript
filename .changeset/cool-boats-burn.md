---
'@clerk/ui': patch
---

Reworks the `<ConfigureSSO />` confirmation step and adds a dedicated reset connection dialog:

- Introduces `<ResetConnectionDialog />` — a modal-based, type-to-confirm dialog scoped to the wizard container that replaces the inline reset confirmation card. Wraps the destructive delete behind `useReverification`, clears the local provider selection, and rewinds the wizard to provider selection on success.
- Restyles the confirmation step body: unified status header with an inline `Active` / `Inactive` badge, grouped Enable SSO and Domain rows, two-column configuration details rendered through `ProfileSection.ItemList`, outlined `Configure again`, destructive `Reset connection`, and an inactive-state banner inside the step footer.
- `Step.Header` now accepts a `badge` prop so a step can render an inline status pill next to its title without crowding the right-aligned children slot.
- `OrganizationProfile` forwards the shared content ref to `<ConfigureSSO />` so the new dialog portals into the wizard chrome when the component is embedded inside the organization profile.
