---
'@clerk/backend': patch
'@clerk/nextjs': patch
'@clerk/astro': patch
---

Updates the redirect logic in satellite applications to permit navigation to public routes after sign-in or sign-up. Previously, users were always redirected to the primary domain or a protected route, even when the original destination was public. This change improves support for more flexible redirect flows in multi-domain setups.
