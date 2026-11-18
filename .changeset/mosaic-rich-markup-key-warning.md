---
'@clerk/mosaic': patch
---

Fix a React "unique key" warning that `OAuthConsent` logged on every render in development. It came from copy that puts a link or button inside a styled part of the text, such as the redirect domain in the consent subtitle.
