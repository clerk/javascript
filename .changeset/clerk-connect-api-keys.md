---
'@clerk/shared': minor
'@clerk/clerk-js': minor
'@clerk/ui': minor
'@clerk/backend': minor
'@clerk/localizations': minor
---

Clerk Connect supports API key connectors. A user pastes a key in `<UserProfile />` (or the app calls `clerk.connect.connections.create({ connector, apiKey })`), and `clerkClient.connect.connections.getCredential({ userId, slug })` returns it as `{ type: 'api_key', apiKey }`.
