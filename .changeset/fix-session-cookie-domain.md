---
'@clerk/backend': patch
---

Read refresh token cookie using `getSuffixedOrUnSuffixedCookie` to stay consistent with the session token and client UAT cookie reads, preventing consumed refresh token errors after `usesSuffixedCookies()` flips
