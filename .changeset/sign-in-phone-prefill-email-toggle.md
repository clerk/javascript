---
'@clerk/ui': patch
---

Fix `<SignIn />` switching back to the phone number field on the first "Use email" click when `initialValues.phoneNumber` is set. The prefilled phone number no longer ends up in the email field.
