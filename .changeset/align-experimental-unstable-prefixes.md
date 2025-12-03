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
- Moved `createTheme` and `simple` to `@clerk/ui/themes/experimental` export path (removed `__experimental_` prefix since they're now in the experimental export)

**Breaking Changes:**

### @clerk/clerk-js
- `__unstable__environment` → `__internal__environment`
- `__unstable__updateProps` → `__internal__updateProps`
- `__unstable__setEnvironment` → `__internal__setEnvironment`
- `__unstable__onBeforeRequest` → `__internal__onBeforeRequest`
- `__unstable__onAfterResponse` → `__internal__onAfterResponse`
- `__unstable__onBeforeSetActive` → `__internal__onBeforeSetActive` (window global)
- `__unstable__onAfterSetActive` → `__internal__onAfterSetActive` (window global)

### @clerk/react
- `__internal__environment` (exposed via IsomorphicClerk, underlying API changed in @clerk/clerk-js)
- `__internal_ClerkUiCtor` (exposed, underlying API changed in @clerk/ui)

### @clerk/nextjs
- `__unstable_invokeMiddlewareOnAuthStateChange` → `__internal_invokeMiddlewareOnAuthStateChange`

### @clerk/ui
- `experimental_createTheme` / `__experimental_createTheme` → `createTheme` (now exported from `@clerk/ui/themes/experimental`)
- `experimental__simple` / `__experimental_simple` → `simple` (now exported from `@clerk/ui/themes/experimental`)

### Removed (multiple packages)
- `__unstable_manageBillingUrl` (removed)
- `__unstable_manageBillingLabel` (removed)
- `__unstable_manageBillingMembersLimit` (removed)
- `experimental__forceOauthFirst` (removed)
