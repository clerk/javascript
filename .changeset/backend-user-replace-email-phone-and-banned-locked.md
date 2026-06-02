---
'@clerk/backend': minor
---

Add support for new Backend API user endpoints:

- `users.replaceUserEmailAddress(userId, { emailAddress })` replaces all of a user's email addresses with a single verified, primary email address (`PUT /users/{user_id}/email_address`).
- `users.replaceUserPhoneNumber(userId, { phoneNumber })` replaces all of a user's phone numbers with a single verified, primary phone number (`PUT /users/{user_id}/phone_number`).
- `users.createUser` now accepts `banned` and `locked` parameters to create a user that is already banned or locked.
