---
"@clerk/nextjs": patch
---

Fixes regression on `@clerk/nextjs/server` (introduced on https://github.com/clerk/javascript/pull/3758) where `server-only` module was being resolved in runtimes without `react-server` available, such as `getAuth` on `getServerSideProps`.
