---
'@clerk/nextjs': patch
---

Update `next` peer dependency to recommend patched versions (`^15.5.15 || ^15.6.0-0 || ^16.2.3`) to address CVE-2026-23869, a high-severity (CVSS 7.5) denial-of-service vulnerability in React Server Components. If you are on an older Next.js version, please upgrade to a patched release as soon as possible.
