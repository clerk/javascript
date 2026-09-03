---
'@clerk/nextjs': minor
'@clerk/shared': minor
---

Print a one-time notice in the server terminal when `<ClerkProvider>` renders with a development publishable key, naming `npx clerk@latest init` as the way to get working keys without a Clerk account. The notice appears once per process, so once per build worker during `next build`, and on the first server render under `next dev`. It never prints in the browser, in deployed runtimes, or when the keys came from keyless mode. It is silenced by the existing `unsafe_disableDevelopmentModeConsoleWarning` prop or `NEXT_PUBLIC_CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING` env var.

Fix `unsafe_disableDevelopmentModeConsoleWarning` being ignored when passed as a prop to the Next.js `<ClerkProvider>`; previously only the env var took effect, so the prop did not silence the browser development-keys warning either.

`@clerk/shared/keys` now exports `accountlessInitGuidance`, the sentence used by this notice and by the existing missing-key errors.
