---
"@clerk/clerk-js": patch
---

fix(clerk-js): OAuth callbacks now respect custom sign-in URLs when routing to factor-one or factor-two. When a custom `signInUrl` is provided via `handleRedirectCallback`, the factor selection pages will be built from that URL instead of the dashboard-configured default, ensuring a consistent sign-in experience for custom integrations.
