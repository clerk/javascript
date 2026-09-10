---
"@clerk/clerk-js": patch
---

Preserve unrelated biometric credential metadata during enrollment and cleanup, reject unreadable storage before creating a key, and remove a replaced key when enrollment reuses a credential ID. Keep successful enrollment and revocation results when optional local cleanup fails. Roll back interrupted enrollment with its initiating session, and honor explicit session IDs in FAPI requests.
