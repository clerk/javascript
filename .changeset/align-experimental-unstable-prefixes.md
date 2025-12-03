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
- Removed deprecated billing-related props and `experimental__forceOauthFirst`

**Breaking Changes:**

- `__unstable__environment` → `__internal__environment`
- `__unstable__updateProps` → `__internal__updateProps`
- `__unstable__setEnvironment` → `__internal__setEnvironment`
- `__unstable__onBeforeSetActive` → `__internal__onBeforeSetActive`
- `__unstable__onAfterSetActive` → `__internal__onAfterSetActive`
- `__unstable__onBeforeRequest` → `__internal__onBeforeRequest`
- `__unstable__onAfterResponse` → `__internal__onAfterResponse`
- `__unstable_ClerkUiCtor` → `__internal_ClerkUiCtor`
- `__unstable_invokeMiddlewareOnAuthStateChange` → `__internal_invokeMiddlewareOnAuthStateChange`
- `experimental_createTheme` → `__experimental_createTheme`
- `experimental__simple` → `__experimental_simple`
- `__unstable_manageBillingUrl` (removed)
- `__unstable_manageBillingLabel` (removed)
- `__unstable_manageBillingMembersLimit` (removed)
- `experimental__forceOauthFirst` (removed)
