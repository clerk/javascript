---
'@clerk/clerk-js': minor
---

- Update the supported API version to `2024-10-01` that includes the following changes
  - Notification for new sign ins to users' accounts feature becomes available.
  - The response for Sign Ins with an email address that matches a **SAML connection** is updated. Instead of responding with a status of `needs_identifier` the API will now return a status of `needs_first_factor` and the email address that matched will be returned in the identifier field. the only strategy that will be included in supported first factors is `enterprise_sso`

  Read more in the [API Version docs](https://clerk.com/docs/backend-requests/versioning/available-versions#2024-10-01)

- Update components to use the new `enterprise_sso` strategy for sign ins / sign ups that match an enterprise connection and handle the new API response.

  This strategy supersedes SAML to provide a single strategy as the entry point for Enterprise SSO regardless of the underlying protocol used to authenticate the user. 

  For now there are two new types of connections that are supported in addition to SAML, Custom OAuth and EASIE (multi-tenant OAuth).
