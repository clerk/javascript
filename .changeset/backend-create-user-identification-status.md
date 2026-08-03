---
'@clerk/backend': patch
---

Add the optional `emailAddressIdentificationStatus` and `phoneNumberIdentificationStatus` parameters to `CreateUserParams`. The Backend API has supported these arrays on `POST /v1/users` since they shipped, but `createUser()` had no way to pass them, so every email address and phone number was necessarily created verified. Each array runs parallel to `emailAddress` / `phoneNumber` — one item per identifier, applied by position — and an item set to `'reserved'` creates that identifier unverified but still usable for sign-in and locked so no other user can claim it.

The `createUser()` documentation is corrected accordingly: it stated unconditionally that created email addresses and phone numbers are automatically verified, which is only the default.
