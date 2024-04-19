---
'@clerk/clerk-sdk-node': major
'@clerk/backend': major
'@clerk/fastify': major
'@clerk/nextjs': major
'@clerk/remix': major
---


Changes in exports of `@clerk/backend`:
- Drop the following internal exports from the top-level api:
    ```typescript
    // Before
    import {
        AllowlistIdentifier,
        Client,
        DeletedObject,
        Email,
        EmailAddress,
        ExternalAccount,
        IdentificationLink,
        Invitation,
        OauthAccessToken,
        ObjectType,
        Organization,
        OrganizationInvitation,
        OrganizationMembership,
        OrganizationMembershipPublicUserData,
        PhoneNumber,
        RedirectUrl,
        SMSMessage,
        Session,
        SignInToken,
        Token,
        User,
        Verification } from '@clerk/backend';
    // After : no alternative since there is no need to use those classes
    ```
    Dropping those exports results in also dropping the exports from `gatsby-plugin-clerk`, `@clerk/clerk-sdk-node`, `@clerk/backend`, `@clerk/fastify`, `@clerk/nextjs`, `@clerk/remix` packages.
- Keep those 3 resource related type exports
    ```typescript
    import type { Organization, Session, User, WebhookEvent, WebhookEventType } from '@clerk/backend'
    ```
