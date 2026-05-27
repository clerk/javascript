---
'@clerk/shared': patch
---

Replace the telemetry `postinstall` script with a one-time runtime notice, printed once per process on server runtimes (Node, excluding CI) when the telemetry collector boots against a development instance. Drops the `std-env` dependency.

Removing `postinstall` improves the package's supply-chain posture: `@clerk/shared` no longer executes arbitrary code at install time, aligning with package-manager defaults that increasingly disable install scripts.

Browser-only applications with no server-side Clerk runtime (e.g. a Vite SPA) will not surface an in-band notice. Telemetry behavior and opt-out (`telemetry={false}` or `*_CLERK_TELEMETRY_DISABLED`) are unchanged; disclosure for these setups is provided at https://clerk.com/docs/telemetry.
