---
"@clerk/clerk-js": minor
"@clerk/types": minor
---

Added support for Custom OAuth providers

- Updated strategy types to include `CustomOAuthStrategy`:
  - Added the `CustomOAuthStrategy` type with the value `oauth_custom_${string}`
  - Modified `OAuthStrategy` to include `CustomOAuthStrategy`:
    `export type OAuthStrategy = `oauth_${OAuthProvider}` | CustomOAuthStrategy;`
- Added the `CustomOauthProvider` type with value `custom_${string}` and extended `OAuthProvider` type to include `CustomOauthProvider`
- Added support for displaying provider initials when `logo_url` is null for custom OAuth providers
- Created new `ProviderInitialIcon` internal component in order to display custom oauth provider initials if provider `logo_url` is null