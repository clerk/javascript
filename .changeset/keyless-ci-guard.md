---
'@clerk/astro': patch
'@clerk/backend': patch
'@clerk/nextjs': patch
'@clerk/nuxt': patch
'@clerk/react-router': patch
'@clerk/shared': patch
'@clerk/tanstack-react-start': patch
---

Prevent keyless mode from activating in CI and other automated environments in framework SDKs.

Framework SDKs now include a source value on accountless application requests, and `@clerk/backend` forwards that source value to the Backend API.
