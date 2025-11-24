---
"@clerk/nextjs": major
"@clerk/react": major
"@clerk/clerk-js": major
"@clerk/shared": major
"@clerk/ui": major
"@clerk/react-router": major
"@clerk/tanstack-react-start": minor
---

Remove all previously deprecated UI props across the Next.js, React and clerk-js SDKs. The legacy `afterSign(In|Up)Url`/`redirectUrl` props, `UserButton` sign-out overrides, organization `hideSlug` flags, `OrganizationSwitcher`'s `afterSwitchOrganizationUrl`, `Client.activeSessions`, `setActive({ beforeEmit })`, and the `ClerkMiddlewareAuthObject` type alias are no longer exported. Components now rely solely on the new redirect options and server-side configuration.
