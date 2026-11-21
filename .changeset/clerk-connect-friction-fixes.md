---
'@clerk/shared': minor
'@clerk/clerk-js': minor
'@clerk/ui': minor
'@clerk/backend': minor
'@clerk/localizations': minor
---

Clerk Connect (experimental) updates:

- Connections have `connectorDisplayName` and `connectorStatus` (`'active' | 'disabled'`). `<UserProfile />` names each connection by its connector, marks a disabled connector's connections as Unavailable, and shows each connection's slug.
- `<UserProfile />` explains each `clerk_connect_error` code, and clears the message on the user's next action.
- `clerk.connect.connections.create()` and `reauthorize()` take `redirect` (default `true`). With `true`, the promise never settles once the browser is sent to the provider. With `false`, they return the `requires_action` result and its `action.url` without navigating.
- `clerk.connect.connections.create()` on a slug whose connection is disconnected or needs attention reauthorizes that connection with the same options. Its errors name SDK parameters (`returnUrl`, `apiKey`).
- `ClerkAPIError.meta` keeps the Connect error fields: `connectionId`, `connectionStatus`, `missingScopes`, `scopesNotAllowed`, `connector` and `availableExpiresIn`.
- In `@clerk/backend`, a Connect API error's `message` is the Clerk error message instead of the HTTP reason. A disconnected connection's credential request fails with `connection_disconnected` (previously `connection_authorization_required`).
- `@clerk/backend` types the `connection.created`, `connection.updated` and `connection.deleted` webhook events as `ConnectionWebhookEvent`.
