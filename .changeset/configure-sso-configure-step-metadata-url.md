---
'@clerk/localizations': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Implement the Okta SAML metadata URL submission path in the Configure step of `<__experimental_ConfigureSSO />`. Adds a single text input for the IdP metadata URL; Continue posts `{ saml: { idpMetadataUrl } }` via `user.updateEnterpriseConnection` wrapped in `useReverification`, with `useCardState` driving the loading state and `handleError` routing backend errors inline to the field or to the card-level error surface. Locale keys added under `configureSSO.configureStep` in `en-US`. Manual entry, file upload, SP-side copy rows, and the Okta admin-console walkthrough ship in follow-up PRs.
