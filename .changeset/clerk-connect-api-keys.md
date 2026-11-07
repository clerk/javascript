---
'@clerk/shared': minor
'@clerk/clerk-js': minor
'@clerk/ui': minor
'@clerk/backend': minor
'@clerk/localizations': minor
---

Clerk Connect supports API key connectors. A user pastes a key in `<UserProfile />`, and `clerkClient.connect.connections.getCredential({ userId, key })` returns it as `{ type: 'api_key', apiKey }`.
