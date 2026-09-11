---
'@clerk/localizations': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

The organization Security page now lists every enterprise SSO connection of the organization, each with its own status, domains, and actions. The SSO wizard edits one explicit connection, and a banner names it when the organization has more than one. Changing a provider or removing a connection now targets that connection instead of the first one returned by the API.
