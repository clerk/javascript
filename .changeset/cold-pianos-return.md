---
'@clerk/clerk-js': minor
'@clerk/shared': minor
'@clerk/localizations': patch
'@clerk/types': patch
---

Introduce `WhatsApp` as an alternative channel for phone code delivery.

The new `channel` property accompanies the `phone_code` strategy. Possible values: `whatsapp` and `sms`.
