---
"@clerk/ui": patch
---

Default the organization selection in `<OAuthConsent />` to the user's last active organization, falling back to the first membership when it is not set or no longer available.
