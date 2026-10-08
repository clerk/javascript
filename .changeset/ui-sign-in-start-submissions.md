---
'@clerk/ui': patch
---

Prevent duplicate forgot-password requests and overlapping sign-in submissions. Release their loading state when the form closes or its source changes. Retry a failed password sign-in with its submitted identifier once, then show any remaining error.

Submit the displayed phone number and selected channel from the alternative phone sign-in form, without an autofilled password from the main form.
