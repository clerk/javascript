---
'@clerk/fastify': minor
---

Re-export everything from `@clerk/backend` in `@clerk/fastify` to support common backend types and functionality without adding `@clerk/backend` as dependency.

New exports:
- `verifyToken()`

New exported types:
- `ClerkOptions`
- `ClerkClient`
- `OrganizationMembershipRole`
- `VerifyTokenOptions`
- `WebhookEvent`
- `WebhookEventType`
- `AllowlistIdentifier`
- `Client`
- `EmailAddress`
- `ExternalAccount`
- `Invitation`
- `OauthAccessToken`
- `Organization`
- `OrganizationInvitation`
- `OrganizationMembership`
- `OrganizationMembershipPublicUserData`
- `PhoneNumber`
- `Session`
- `SignInToken`
- `SMSMessage`
- `Token`
- `User`