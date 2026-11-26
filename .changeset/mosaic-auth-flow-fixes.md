---
'@clerk/mosaic': patch
---

Sign-in, sign-up and organization fixes:

- An unknown email in a combined sign-in or sign-up now says "No Acme account uses …" with a link to use a different email, instead of going silently to the sign-up form.
- Choosing another two-step verification method no longer offers social providers, and the screen is titled "Verify another way".
- The backup-code screen offers "Sign in with another account", like the other two-step screens.
- Password managers can now tell which account a password belongs to on the password step.
- The edit button on the password and passkey steps names the identifier, which may be a username or phone number.
- When an account has several email addresses or phone numbers, choosing "Email code" or "Text message" lists them first, and the code is only sent once one is picked.
- After Resend, focus returns to the code. On full-page code screens without a resend line, the verifying status replaces the links so the card no longer changes height.
- On the email link screen, "Use another method" is a quiet link on full-page cards.
- Organization slugs drop accents and trailing punctuation, so "Café Société" becomes `cafe-societe` and "Acme Inc." becomes `acme-inc`.
- The choose-organization footer keeps "Sign out" next to "Signed in as …".
