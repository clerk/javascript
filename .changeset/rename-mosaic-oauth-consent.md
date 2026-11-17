---
'@clerk/mosaic': minor
---

**Breaking:** Rename `Consent` to `OAuthConsent`. Behavior is unchanged; TypeScript flags the old names.

| Before                                       | After                                              |
| -------------------------------------------- | -------------------------------------------------- |
| `Consent`                                    | `OAuthConsent`                                     |
| `ConsentProps`                               | `OAuthConsentProps`                                |
| `consent.*` localization keys                | `oauthConsent.*`                                   |
| `consent_missing_client_id` error code       | `oauth_consent_missing_client_id`                  |
| `consent_missing_redirect_uri` error code    | `oauth_consent_missing_redirect_uri`               |
| `.cl-consent-scopes` / `.cl-consent-redirect-url` | `.cl-oauth-consent-scopes` / `.cl-oauth-consent-redirect-url` |

Find usages with `git grep -nE "\bConsent(Props)?\b|consent[._-](missing|scopes|redirect)|'consent\."`.
