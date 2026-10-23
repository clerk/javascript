---
'@clerk/mosaic': patch
---

`<UserButton />` and `<OrganizationSwitcher />` now report a `COMPONENT_MOUNTED` telemetry event on development instances, with a summary of how they are configured (modes, counts and flags, never user data). Opt out the same way as other Clerk telemetry: pass `telemetry={false}` to your Clerk provider or set your framework's telemetry-disabled environment variable, such as `NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED=1`.
