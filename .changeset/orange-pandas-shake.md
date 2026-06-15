---
'@clerk/localizations': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Add an overview to the organization profile Security page. The page now lands on a summary of the SSO connection — a status badge (Unconfigured, In Progress, Active, Inactive), the configuration details framed in a card (provider, domain, sign-on URL, issuer, certificate), and an actions menu with Edit, Activate / Deactivate, and Remove — and switches into the existing configuration flow on Start, Continue, or Edit.
