---
'@clerk/mosaic': minor
---

`OAuthConsent` now lets the user grant access to several organizations, up to the limit the instance allows. Once the limit is picked, the rest of the list is disabled, and Allow is disabled if more than the limit are ever selected or while no organization is picked. The form posts the picked organizations as one space-separated `organization_id`. On an instance that allows one organization for each consent, or with a `clerk-js` that does not report the limit, the selection of one organization is unchanged.
