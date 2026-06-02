---
'@clerk/ui': patch
---

Adds a wizard-wide reset connection entry on the `<ConfigureSSO />` step footers:

- New `Step.Footer.Reset` compound part that renders a destructive ghost button on the leading edge of the footer and opens the existing `ResetConnectionDialog`. The slot owns its own open state and gates itself on the current enterprise connection, so it stays hidden on the provider selection step.
- Wires the reset entry into the Verify Domain, Configure (Okta and Custom SAML), and Test steps so the reset action is reachable from anywhere in the wizard. The confirmation step keeps its in-body destructive button.
- Exposes a `configureSSOFooterResetButton` element descriptor so the new button surface can be themed via appearance customizations.
