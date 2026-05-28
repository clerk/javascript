---
'@clerk/ui': patch
'@clerk/localizations': patch
'@clerk/shared': patch
---

When an email verification code expires, components now automatically request a new code instead of leaving the user staring at a raw "This verification has expired. You must create a new one." message and waiting for them to click the Resend button. The OTP input is reset and a softer "Your code expired. We sent a new one." message is shown via the new `formFieldError__verificationExpiredCodeResent` localization key. Phone-code expiration is unchanged (manual Resend remains).
