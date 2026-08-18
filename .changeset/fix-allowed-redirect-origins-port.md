---
"@clerk/shared": patch
---

Fix satellite domain redirect validation incorrectly rejecting URLs with non-default ports. Redirect URLs like `https://app.example.net:5173` (common in local development with Vite or similar dev servers) are now correctly matched against `allowedRedirectOrigins` patterns such as `https://*.example.net`.
