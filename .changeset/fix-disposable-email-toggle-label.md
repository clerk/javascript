---
'@clerk/backend': patch
---

Correct two Dashboard labels referenced in the instance restrictions documentation. `blockDisposableEmailDomains` bolded "Block sign-ups that use disposable email domains", but the toggle in the Clerk Dashboard is "Block sign-ups that use disposable email addresses". `ignoreDotsForGmailAddresses` bolded "Ignore dots for Gmail addresses" as a Dashboard toggle, but no such control exists — the wording now matches the equivalent comment on `UpdateRestrictionsParams`. Property names are unchanged.
