---
'@clerk/clerk-js': minor
'@clerk/react': patch
'@clerk/shared': minor
'@clerk/ui': patch
---

Complete an OAuth account transfer that was interrupted by a verification challenge, instead of returning the user to the start of sign-in.

Signing up with a social provider from the sign-in page works by transfer: the sign-in comes back with a transferable first-factor verification, and the client completes it as a sign-up. That continuation lives in the redirect-callback router, and a challenge on the sign-in short-circuits the router before it is reached. When the challenge cleared, the challenge card routed onward using only the interactive sign-in statuses, so a sign-in awaiting transfer fell through to the start form — which surfaced a stale `external_account_not_found` and reset the attempt, leaving a flow that could not be completed and reproduced on every retry.

The card now hands back to the redirect-callback router, which resumes from where it stopped rather than starting over. The pending transfer is latched before the challenge runs, so it survives a response that re-serializes the sign-in without it.

Also fixed alongside it: a stale or direct visit to the sign-in `protect-check` route now returns to the start of the flow instead of rendering an empty card, matching the sign-up side; and a failure in the SSO callback now shows a message and recovers, where previously the error handler could throw out of its own `catch` and leave the page loading indefinitely.
