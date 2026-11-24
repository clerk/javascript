---
'@clerk/shared': minor
---

`SignUpFuture.create()` accepts a `channel`. Pass it with `strategy: 'phone_code'` and a `phoneNumber` to create the sign-up and send the verification code over that channel, such as `'whatsapp'`, in a single request instead of calling `SignUpFuture.verifications.sendPhoneCode()` afterwards.
