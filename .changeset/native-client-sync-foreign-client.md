---
'@clerk/expo': patch
---

Keep the active session when a native client change resolves to a different, signed-out client. The check that discards those clients compared a reference that the refresh had already mutated, so it never engaged and the signed-out client was applied over the current session.
