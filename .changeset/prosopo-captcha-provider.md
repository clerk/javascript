---
'@clerk/clerk-js': minor
'@clerk/shared': minor
---

Add Prosopo Procaptcha as an alternative CAPTCHA provider alongside Cloudflare Turnstile. When `displayConfig.captchaProvider` is `'prosopo'`, clerk-js now loads the Procaptcha bundle from `js.prosopo.io` and renders an invisible or smart widget into the same containers Turnstile uses today (the auto-generated invisible div and the user-supplied `#clerk-captcha` element). Turnstile remains the default and the existing flow is unchanged for instances that have not opted into Prosopo. The public `CaptchaProvider` type now accepts `'turnstile' | 'prosopo'`.
