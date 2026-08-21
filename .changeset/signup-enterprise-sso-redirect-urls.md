---
'@clerk/shared': patch
'@clerk/ui': patch
---

Fix sign-ups that continue into an enterprise SSO connection failing with `invalid_redirect_url` ("Redirect url invalid") instead of redirecting to the identity provider.

A sign-up does not always know it requires `enterprise_sso` when the form is first submitted — the requirement appears once the identity behind the sign-up is resolved, which can happen several steps later. Whichever step was active at that point performed the hand-off to the identity provider, and most of them did so without the redirect URLs it requires, so the request was rejected and the sign-up dead-ended with no way to continue. Retrying reproduced it every time. Flows that reached SSO directly from the first sign-up form were unaffected, which is why this only showed up on some sign-ups.

The redirect URLs are now derived from the sign-up context wherever the flow continues, so the hand-off works from every step: the continue form, email-link and code verification, and the verification step that precedes them.
