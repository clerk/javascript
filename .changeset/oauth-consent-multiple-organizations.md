---
'@clerk/mosaic': minor
---

`OAuthConsent` now lets the user grant access to up to 5 organizations instead of one. Once 5 are picked, the rest of the list is disabled, and Allow is disabled if more than 5 are ever selected. The form posts the picked organizations as one space-separated `organization_id`. Allow is disabled while no organization is picked.
