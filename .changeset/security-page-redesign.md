---
'@clerk/localizations': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Update the SSO and Directory Sync sections of the `<OrganizationProfile />` Security page to the latest designs. Both sections now show a "Configure" button until something is set up (SSO then shows "Add connection"), and SSO connection rows show the identity provider's logo and an actions menu (Edit, Continue configuration, Activate/Deactivate, Remove). These actions have been removed from the SSO connection page, and status badges are no longer color-coded.

The SSO button uses the new `ssoSection.primaryButton__configure` localization key; `ssoSection.primaryButton__startConfiguration` is deprecated and no longer used. In `directorySyncSection`, `primaryButton__startConfiguration` is renamed to `primaryButton__configure` and `badge__unconfigured` is removed.
