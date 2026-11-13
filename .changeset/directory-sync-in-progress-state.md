---
'@clerk/ui': patch
'@clerk/localizations': patch
'@clerk/shared': patch
---

Show a Google Workspace directory that still needs its service account credentials as **In Progress** in the `<OrganizationProfile />` Security tab, with a **Continue configuration** button that reopens the wizard at the credentials step. It used to read **Inactive** and offer **Activate**, which the server refuses until the credentials are stored. The wizard stepper also stops ticking the configure step before the credentials exist.
