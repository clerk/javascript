---
'@clerk/clerk-js': patch
---

Fixes an issue where the phone number value was not properly copied onto the input when pasting on the email or username field in the `<SignIn/>` component after autoswitching to the phone number field. The issue was introduced with the changes for the Prefill `<SignIn/>` and `<SignUp/>` feature.