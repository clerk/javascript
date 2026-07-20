---
'@clerk/backend': minor
---

Fix a cross-origin handshake bypass where `isKnownClerkReferrer()` trusted overly broad referrer hosts as Clerk-owned: any `accounts.*` host (e.g. `accounts.attacker.com`), plus dev account-portal domains (`*.accounts.dev` and legacy suffixes) on production instances. These let unrelated origins skip the handshake and its session-freshness check. The referrer is now trusted only for the accounts portal derived from the instance's frontend API, plus dev account-portal domains on non-production instances.
