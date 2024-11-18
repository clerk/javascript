---
'@clerk/clerk-js': minor
'@clerk/backend': minor
---

Update the supported API version to `2024-10-01` that includes the following changes

1. Notification for new sign ins to users' accounts feature becomes available.
2. The response for Sign Ins with an email address that matches a **SAML connection** is updated. Instead of responding with a status of `needs_identifier` the API will now return a status of `needs_first_factor` and the email address that matched will be returned in the identifier field. the only strategy that will be included in supported first factors is `enterprise_sso`

Read more in the [API Version docs](https://clerk.com/docs/backend-requests/versioning/available-versions#2024-10-01)
