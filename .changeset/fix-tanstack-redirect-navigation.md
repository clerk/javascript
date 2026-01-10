---
"@clerk/tanstack-react-start": patch
---

Fix incorrect redirects when navigating away from sign-in/sign-up pages. The navigation promise is now resolved only after the location actually changes, preventing Clerk from issuing faulty redirects to non-existent pages.