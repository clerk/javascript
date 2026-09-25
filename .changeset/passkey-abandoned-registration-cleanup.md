---
'@clerk/clerk-js': patch
'@clerk/ui': patch
---

Fix abandoned passkey registrations counting toward the limit on unverified identifications. Cancelling or failing the browser passkey prompt left a pending registration on the account that is hidden from the user's passkey list, so it could silently block adding an email address or phone number until it expired. The pending registration is now removed as soon as the prompt is abandoned. In `<UserProfile />`, the "Add a passkey" button also shows a loading state while a registration is in progress, and a failed attempt no longer leaves its error banner on screen after a later attempt succeeds.
