---
'@clerk/ui': patch
---

Remove back button on the sign-in password compromised/pwned error screen.

These errors are not recoverable by re-entering the password, so the back button led to a confusing dead end that would always take you back to the same error.
