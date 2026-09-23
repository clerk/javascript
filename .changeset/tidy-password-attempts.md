---
'@clerk/localizations': patch
'@clerk/shared': patch
'@clerk/ui': patch
---

Show remaining password confirmation attempts and session-ended explanations during password changes and reverification. These appear only when an instance enables password confirmation protection, which is off by default. The messages are localizable through `unstable__errors.password_confirmation_attempt_remaining`, `unstable__errors.password_confirmation_attempts_remaining` (with `{{remainingAttempts}}`), and `unstable__errors.password_confirmation_session_ended`.
