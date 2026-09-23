---
'@clerk/localizations': minor
'@clerk/shared': minor
'@clerk/ui': minor
---

Show how many password attempts remain when a user enters the wrong current password while changing their password or during reverification, and explain that the session has ended once the attempts run out. This only applies to instances that enable password confirmation protection, which is off by default.

- `ClerkAPIError.meta.remainingAttempts` holds the attempts left in the current session. `0` means the session has ended.
- Customize the messages with the `unstable__errors.password_confirmation_attempt_remaining`, `unstable__errors.password_confirmation_attempts_remaining` (receives `{{remainingAttempts}}`), and `unstable__errors.password_confirmation_session_ended` localization keys.
