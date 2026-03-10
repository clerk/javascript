---
"@clerk/shared": patch
"@clerk/nextjs": patch
"@clerk/astro": patch
"@clerk/react-router": patch
"@clerk/nuxt": patch
"@clerk/tanstack-react-start": patch
---

Add `Netlify-Vary` header to prevent Netlify CDN from caching auth responses across different users/sessions. Sets `Netlify-Vary: cookie=__client_uat,cookie=__session` on all auth responses when running on Netlify, ensuring the CDN creates separate cache entries per auth state.
