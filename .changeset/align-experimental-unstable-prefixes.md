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
- `__unstable__environment` → `__internal_environment`
- `__unstable__updateProps` → `__internal_updateProps`
- `__unstable__setEnvironment` → `__internal_setEnvironment`
- `__unstable__onBeforeRequest` → `__internal_onBeforeRequest`
- `__unstable__onAfterResponse` → `__internal_onAfterResponse`
- `__unstable__onBeforeSetActive` → `__internal_onBeforeSetActive` (window global)
- `__unstable__onAfterSetActive` → `__internal_onAfterSetActive` (window global)

### @clerk/nextjs
- `__unstable_invokeMiddlewareOnAuthStateChange` → `__internal_invokeMiddlewareOnAuthStateChange`

### @clerk/ui
- `experimental_createTheme` / `__experimental_createTheme` → `createTheme` (now exported from `@clerk/ui/themes/experimental`)
- `experimental__simple` / `__experimental_simple` → `simple` (now exported from `@clerk/ui/themes/experimental`)

### @clerk/chrome-extension
- `__unstable__createClerkClient` → `createClerkClient` (exported from `@clerk/chrome-extension/background`)

### Removed (multiple packages)
- `__unstable_manageBillingUrl` (removed)
- `__unstable_manageBillingLabel` (removed)
- `__unstable_manageBillingMembersLimit` (removed)
- `experimental__forceOauthFirst` (removed)
