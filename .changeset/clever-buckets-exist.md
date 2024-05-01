---
'@clerk/backend': patch
---

Fix the following `@clerk/backend` methods to populate their paginated responses:
- `clerkClient.allowListIndentifiers.getAllowlistIdentifierList()`
- `clerkClient.clients.getClientList()`
- `clerkClient.invitations.getInvitationList`
- `clerkClient.redirectUrls.getRedirectUrlList()`
- `clerkClient.sessions.getSessionList()`
- `clerkClient.users.getUserOauthAccessToken()`
