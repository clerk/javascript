---
'@clerk/localizations': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Each enterprise connection listed on the organization Security page now opens its own page. It lists the connection name and domains, the service provider values to copy into the identity provider, the identity provider configuration behind an Edit form, and the connection settings as a form you save. The header carries one action, either Activate or Continue setup, and deactivating or removing the connection lives in a Danger zone section at the bottom of the page. The row menu is gone; click the row instead.

The setup wizard's domains step now shows a checkbox per verified domain, so an admin picks which domains a connection covers. A domain another connection of the organization already authenticates is disabled and labelled with that connection's name, and an error from creating the connection is shown on the provider step instead of being dropped.

New customization handles ship with it: the `organizationProfileSecuritySsoConnectionRow` and `organizationProfileSecuritySsoConnectionPage` appearance elements, the `configureSSOVerifyDomainCardCheckbox` element, the `claimed` badge id, the new `FieldId` values for the connection settings, and the `ssoConnectionName`, `ssoConnectionDomains`, `ssoConnectionServiceProvider`, `ssoConnectionIdentityProvider`, `ssoConnectionSettings` and `ssoConnectionDangerZone` `ProfileSectionId` values.
