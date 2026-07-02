---
---

Fix the E2E cleanup script so it actually drains test-user backlogs: paginate `getUserList` (oldest-first, no 150 cap), broaden the search query to catch the legacy `+clerk_test_<hash>@example.com` email pattern alongside the current `@clerkcookie.com` pattern, and gate deletion behind a strict test-domain whitelist so Clerk team accounts caught by the broader query are preserved.
