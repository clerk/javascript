---
'@clerk/backend': patch
'@clerk/clerk-js': patch
'@clerk/nextjs': patch
'@clerk/shared': patch
---

Add auto-proxy detection for eligible hosts, including Vercel production static-generation builds that can infer a relative proxy URL from platform env vars.
