---
'@clerk/ui': minor
---

When a verification check fails during sign-in or sign-up, the card now shows a reference: the sign-in or sign-up id and the error code. Users can copy it and send it to support. It can be styled with the new `protectCheckReferenceBox`, `protectCheckReferenceLabel` and `protectCheckReference` appearance elements. Also, "Try again" after a check that didn't complete in time now returns to the start of the flow, so the next attempt gets a new check. Before, retrying failed again with the same error.
