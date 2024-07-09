---
"@clerk/clerk-js": patch
"@clerk/types": patch
---

Added support for Custom OAuth providers

- Updated strategy types to include CustomOAuthStrategy:
  - Added `export type CustomOAuthStrategy = `oauth_custom_${string}`;`
  - Modified `OAuthStrategy` to include CustomOAuthStrategy:
    `export type OAuthStrategy = `oauth_${OAuthProvider}` | CustomOAuthStrategy;`
- Added new type: `export type CustomOauthProvider = `custom_${string}`;` and extend `OAuthProvider` type to include `CustomOauthProvider`
- Added support for displaying provider initials when logo_url is null for custom OAuth providers
- Created new `InitialIcon` component in order to display custom oauth provider initials if provider `logo_url` is null