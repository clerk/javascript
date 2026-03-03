---
"@clerk/clerk-js": major
"@clerk/react": major
"@clerk/nextjs": major
"@clerk/vue": major
"@clerk/astro": major
"@clerk/expo": major
"@clerk/chrome-extension": major
"@clerk/shared": major
"@clerk/ui": major
---

Align experimental/unstable prefixes to use consistent naming:

- Renamed all `__unstable_*` methods to `__internal_*` (for internal APIs)
- Renamed all `experimental__*` and `experimental_*` methods to `__experimental_*` (for beta features)
- Removed deprecated billing-related props (`__unstable_manageBillingUrl`, `__unstable_manageBillingLabel`, `__unstable_manageBillingMembersLimit`) and `experimental__forceOauthFirst`
