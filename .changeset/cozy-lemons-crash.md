---
'@clerk/nextjs': patch
---

Fix an App Router navigation edge case where duplicate in-flight redirects to the same destination could leave Clerk's awaitable navigation pending indefinitely. We now coalesce duplicate same-destination pushes into a single in-flight transition, reset pending destination state after flush, and add regression tests for duplicate and post-flush navigation behavior.
