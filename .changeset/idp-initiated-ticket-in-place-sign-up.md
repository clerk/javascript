---
'@clerk/ui': patch
---

Fix an issue where `<SignIn>` stalled on a loading card when handling a ticket for a user who does not exist yet. Invitations and IdP-initiated enterprise SSO redirect these tickets to the instance's sign-up URL, and when that URL is the sign-in page itself there was no sign-up flow to hand them off to. `<SignIn>` now consumes the ticket in place, creating the user and signing them in without a separate sign-up page.
