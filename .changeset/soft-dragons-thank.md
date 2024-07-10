---
"@clerk/astro": patch
---

Change prefix for public env variables to `PUBLIC_`. The previous prefix was `PUBLIC_ASTRO_APP_`.
- After this change the publishable key from should be set as `PUBLIC_CLERK_PUBLISHABLE_KEY=xxxxx`
