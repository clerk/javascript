---
'@clerk/astro': minor
'@clerk/nuxt': minor
'@clerk/react-router': minor
'@clerk/tanstack-react-start': minor
'@clerk/shared': patch
---

Add an env-var shortcut for `unsafe_disableDevelopmentModeConsoleWarning` across the Astro, Nuxt, React Router, and TanStack Start integrations so the development-keys console warning can be suppressed without threading the option through `<ClerkProvider>` manually:

- Astro: `PUBLIC_CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING`
- Nuxt: `NUXT_PUBLIC_CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING`
- React Router: `VITE_CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING` (or `CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING`)
- TanStack Start: `VITE_CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING` (or `CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING`)

The Next.js equivalent (`NEXT_PUBLIC_CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING`) already existed; the JSDoc on `unsafe_disableDevelopmentModeConsoleWarning` now lists every framework's env-var shortcut and clarifies that suppressing the warning at source also keeps it from being mirrored to the dev-server terminal (e.g. Next.js with `experimental.browserDebugInfoInTerminal`).
