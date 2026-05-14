---
'@clerk/nextjs': patch
---

Bump `next` devDependency to `15.5.18` to pick up the fix for GHSA-26hh-7cqf-hhc6, a high-severity (CVSS 7.5) Middleware/Proxy bypass in App Router applications via segment-prefetch routes (incomplete-fix follow-up). If you use the Next.js App Router, we recommend upgrading to Next.js `15.5.18` or later.
