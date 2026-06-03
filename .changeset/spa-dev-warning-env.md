---
'@clerk/react-router': patch
---

Read `VITE_CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING` on the client when React Router is used in SPA mode (or as a library). Previously the env-var shortcut only took effect through the SSR `rootAuthLoader`, so client-only setups had no way to suppress the development-keys warning without passing `unsafe_disableDevelopmentModeConsoleWarning` to `<ClerkProvider>` directly.
