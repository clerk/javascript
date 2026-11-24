---
'@clerk/shared': minor
---

Add a `channel` option to `signUp.create()`. Pass it with `strategy: 'phone_code'` and a `phoneNumber` to create the sign-up and send the verification code over that channel, such as `'whatsapp'`, in a single request instead of calling `signUp.verifications.sendPhoneCode()` afterwards.
