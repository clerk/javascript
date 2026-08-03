---
'@clerk/clerk-js': patch
---

Complete the Safari ITP cookie refresh when `setActive({ redirectUrl })` navigates.

Safari's ITP caps the client cookie at 7 days when it is re-issued from a fetch, so `setActive()` routes its redirect through `/v1/client/touch` to restore the full lifetime. That navigation was immediately followed by a second one to the undecorated redirect URL, which superseded it and aborted the touch request before it completed, leaving the cookie capped.

This applies to flows that pass `redirectUrl` without a `navigate` callback — email link sign-in, the password reset success screen, the OAuth popup flow, and direct `setActive({ session, redirectUrl })` calls — in apps where Clerk performs a full page navigation rather than handing off to a router. Users still landed on the correct page, so the only symptom was Safari sessions ending after 7 days and returning devices being challenged as if they were new.
