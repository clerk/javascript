---
'@clerk/backend': patch
---

The `emails` endpoint helper and the corresponding `createEmail` method have been removed from the `@clerk/backend` SDK and `apiClint.emails.createEmail` will no longer be available. 

We will not be providing an alternative method for creating and sending emails directly from our JavaScript SDKs with this release. If you are currently using `createEmail` and you wish to update to the latest SDK version, please reach out to our support team (https://clerk.com/support) so we can assist you.
