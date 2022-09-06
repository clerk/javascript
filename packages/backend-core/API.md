# Clerk Backend API Resource reference

Reference of the methods supported in the Clerk Backend API wrapper. [API reference](https://docs.clerk.dev/reference/backend-api-reference/)

```diff
! All methods should be called from a [ClerkBackendApi](./src/api/ClerkBackendApi.ts) instance.
```

- [Allowlist operations](#allowlist-operations)
  - [getAllowlistIdentifierList()](#getallowlistidentifierlist)
  - [createAllowlistIdentifier(params)](#createallowlistidentifierparams)
  - [deleteAllowlistIdentifier(allowlistIdentifierId)](#deleteallowlistidentifierallowlistidentifierid)
- [Client operations](#client-operations)
  - [getClientList()](#getclientlist)
  - [getClient(clientId)](#getclientclientid)
  - [verifyClient(sessionToken)](#verifyclientsessiontoken)
- [Invitation operations](#invitation-operations)
  - [getInvitationList()](#getinvitationlist)
  - [createInvitation(params)](#createinvitationparams)
  - [revokeInvitation(invitationId)](#revokeinvitationinvitationid)
- [Organization operations](#organization-operations)
  - [getOrganizationList()](#getorganizationlist)
  - [createOrganization(params)](#createorganizationparams)
  - [getOrganization(params)](#getorganizationparams)
  - [updateOrganization(organizationId, params)](#updateorganizationorganizationid-params)
  - [updateOrganizationMetadata(organizationId, params)](#updateorganizationmetadataorganizationid-params)
  - [deleteOrganization(organizationId)](#deleteorganizationorganizationid)
  - [getPendingOrganizationInvitationList(params)](#getpendingorganizationinvitationlistparams)
  - [createOrganizationInvitation(params)](#createorganizationinvitationparams)
  - [revokeOrganizationInvitation(params)](#revokeorganizationinvitationparams)
  - [getOrganizationMembershipList(params)](#getorganizationmembershiplistparams)
  - [createOrganizationMembership(params)](#createorganizationmembershipparams)
  - [updateOrganizationMembership(params)](#updateorganizationmembershipparams)
  - [deleteOrganizationMembership(params)](#deleteorganizationmembershipparams)
- [Redirect URLs](#redirect_urls)
  - [createRedirectUrl](#create-redirect-url)
  - [getRedirectUrlList](#get-redirect-url-list)
  - [getRedirectUrl](#get-redirect-url)
  - [deleteRedirectUrl](#delete-redirect-url)
- [Session operations](#session-operations)
  - [getSessionList({ clientId, userId })](#getsessionlist-clientid-userid-)
  - [getSession(sessionId)](#getsessionsessionid)
  - [revokeSession(sessionId)](#revokesessionsessionid)
  - [verifySession(sessionId, sessionToken)](#verifysessionsessionid-sessiontoken)
- [Sign in tokens](#sign-in-tokens)
  - [createSignInToken({ user_id, expires_in_seconds })](#create-sign-in-token)
  - [revokeSignInToken(tokenId)](#revoke-sign-in-token)
- [User operations](#user-operations)
  - [getUserList()](#getuserlist)
  - [getUser(userId)](#getuseruserid)
  - [createUser(params)](#createuserparams)
  - [updateUser(userId, params)](#updateuseruserid-params)
  - [deleteUser(userId)](#deleteuseruserid)
  - [disableUserMFA(userId)](#disableusermfauserid)
- [Email operations](#email-operations)
  - [createEmail({ fromEmailName, subject, body, emailAddressId })](#createemail-fromemailname-subject-body-emailaddressid-)
- [SMS Message operations](#sms-message-operations)
  - [createSMSMessage({ message, phoneNumberId })](#createsmsmessage-message-phonenumberid-)
- [Error handling](#error-handling)

## Allowlist operations

Allowlist operations are exposed by the `allowlistIdentifiers` sub-api (`clerkAPI.allowlistIdentifiers`).

#### getAllowlistIdentifierList()

Retrieves the list of allowlist identifiers.

```ts
const allowlistIdentifiers = await clerkAPI.allowlistIdentifiers.getAllowlistIdentifierList();
```

#### createAllowlistIdentifier(params)

Adds a new identifier to the allowlist.

Accepts an `identifier` parameter, which can be:

- A phone number in international ([E.164](https://en.wikipedia.org/wiki/E.164)) format.
- An email address.
- A wildcard email address (`*.domain.com`). Use this `identifier` value to allow any email address in a particular email domain.

You can also control if you want to notify the owner of the `identifier`, by setting the `notify` property to `true`. The `notify` property is not available for wildcard identifiers.

```ts
const allowlistIdentifier = await clerkAPI.allowlistIdentifiers.createAllowlistIdentifier({
  identifier: 'test@example.com',
  notify: false,
});
```

#### deleteAllowlistIdentifier(allowlistIdentifierId)

Deletes an allowlist identifier, specified by the `allowlistIdentifierId` parameter. Throws an error if the `allowlistIdentifierId` parameter is invalid.

```ts
await clerkAPI.allowlistIdentifiers.deleteAllowlistIdentifier('alid_randomid');
```

## Client operations

Client operations are exposed by the `clients` sub-api (`clerkAPI.clients`).

#### getClientList()

Retrieves the list of clients:

```ts
const clients = await clerkAPI.clients.getClientList();
```

#### getClient(clientId)

Retrieves a single client by its id, if the id is valid. Throws an error otherwise.

```ts
const clientID = 'my-client-id';
const client = await clerkAPI.clients.getClient(clientId);
```

#### verifyClient(sessionToken)

Retrieves a client for a given session token, if the session is active:

```ts
const sessionToken = 'my-session-token';
const client = await clerkAPI.clients.verifyClient(sessionToken);
```

## Invitation operations

Invitation operations are exposed by the `invitations` sub-api (`clerkAPI.invitations`).

#### getInvitationList()

Retrieves a list of all non-revoked invitations for your application, sorted by descending creation date.

```ts
const invitations = await clerkAPI.invitations.getInvitationList();
```

#### createInvitation(params)

Creates a new invitation for the given email address and sends the invitation email.

Keep in mind that you cannot create an invitation if there is already one for the given email address. Also, trying to create an invitation for an email address that already exists in your application will result in an error.

You can optionally pass a `redirectUrl` parameter when creating the invitation and the invitee will be redirected there after they click the invitation email link.

```js
const invitation = await clerkAPI.invitations.createInvitation({
  emailAddress: 'invite@example.com',
  redirectUrl: 'https://optionally-redirect-here',
});
```

#### revokeInvitation(invitationId)

Revokes the invitation with the provided `invitationId`. Throws an error if `invitationId` is invalid.

Revoking an invitation makes the invitation email link unusable. However, it doesn't prevent the user from signing up if they follow the sign up flow.

Only active (i.e. non-revoked) invitations can be revoked.

```js
const invitation = await clerkAPI.invitations.revokeInvitation('inv_some-id');
```

## Organization operations

Organization operations are exposed by the `organizations` sub-api (`clerkAPI.organizations`).

#### getOrganizationList()

Retrieves a list of organizations for an instance.

The instance is determined by the API key you've provided when configuring the API. You can either set the `CLERK_API_KEY` environment variable, or provide the `apiKey` property explicitly when configuring the API client.

Results can be paginated by providing an optional `limit` and `offset` pair of parameters.

Results will be ordered by descending creation date. Most recent organizations will be first in the list.

```ts
const organizations = await clerkAPI.organizations.getOrganizationList();
```

#### createOrganization(params)

Creates a new organization with the given name and optional slug.

You need to provide the user ID who is going to be the organization owner. The user will become an administrator for the organization.

Available parameters are:

- _name_ The name for the organization.
- _createdBy_ The ID of the user who is going to be the organization administrator.
- _publicMetadata_ Metadata saved on the organization, that is visible to both your Frontend and Backend APIs.
- _privateMetadata_ Metadata saved on the organization, that is only visible to your Backend API.

```js
const organization = await clerkAPI.organizations.createOrganization({
  name: 'Acme Inc',
  slug: 'acme-inc',
  createdBy: 'user_1o4q123qMeCkKKIXcA9h8',
});
```

#### getOrganization(params)

Fetch an organization whose ID or slug matches the one provided in the parameters.

The method accepts either the organization ID or slug in the parameters, but not both at the same time. See the snippet below for a usage example.

The instance that the organization belongs to is determined by the API key you've provided when configuring the API. You can either set the `CLERK_API_KEY` environment variable, or provide the `apiKey` property explicitly when configuring the API client.

Available parameters:

- _organizationId_ The ID of the organization.
- _slug_ Alternatively, you can provide the slug of the organization.

```ts
const organizationBySlug = await clerkAPI.organizations.getOrganization({
  slug: 'acme-inc',
});

const organizationById = await clerkAPI.organizations.getOrganization({
  organizationId: 'org_1o4q123qMeCkKKIXcA9h8',
});
```

#### updateOrganization(organizationId, params)

Update the organization specified by `organizationId`.

Available parameters are:

- _name_ The name for the organization.

```js
const organization = await clerkAPI.organizations.updateOrganization('org_1o4q123qMeCkKKIXcA9h8', {
  name: 'Acme Inc',
});
```

#### updateOrganizationMetadata(organizationId, params)

Update an organization's metadata attributes by merging existing values with the provided parameters.

You can remove metadata keys at any level by setting their value to `null`.

Available parameters are:

- _publicMetadata_ Metadata saved on the organization, that is visible to both your Frontend and Backend APIs.
- _privateMetadata_ Metadata saved on the organization, that is only visible to your Backend API.

```js
const organization = await clerkAPI.organizations.updateOrganizationMetadata('org_1o4q123qMeCkKKIXcA9h8', {
  publicMetadata: { color: 'blue' },
  privateMetadata: { sandbox_mode: true },
});
```

#### deleteOrganization(organizationId)

Delete an organization with the provided `organizationId`. This action cannot be undone.

```js
await clerkAPI.organizations.deleteOrganization(organizationId);
```

#### getPendingOrganizationInvitationList(params)

Retrieve a list of pending organization invitations for the organization specified by `organizationId`.

The method supports pagination via optional `limit` and `offset` parameters. The method parameters are:

- _organizationId_ The unique ID of the organization to retrieve the pending invitations for
- _limit_ Optionally put a limit on the number of results returned
- _offset_ Optionally skip some results

```ts
const invitations = await clerkAPI.organizations.getPendingOrganizationInvitationList({
  organizationId: 'org_1o4q123qMeCkKKIXcA9h8',
});
```

#### createOrganizationInvitation(params)

Create an invitation to join an organization and send an email to the email address of the invited member.

You must pass the ID of the user that invites the new member as `inviterUserId`. The inviter user must be an administrator in the organization.

Available parameters:

- _organizationId_ The unique ID of the organization the invitation is about.
- _emailAddress_ The email address of the member that's going to be invited to join the organization.
- _role_ The new member's role in the organization.
- _inviterUserId_ The ID of the organization administrator that invites the new member.
- _redirectUrl_ An optional URL to redirect to after the invited member clicks the link from the invitation email.

```js
const invitation = await clerkAPI.organizations.createOrganizationInvitation({
  organizationId: 'org_1o4q123qMeCkKKIXcA9h8',
  inviterUserId: 'user_1o4q123qMeCkKKIXcA9h8',
  emailAddress: 'invited@example.org',
  role: 'basic_member',
  redirectUrl: 'https://example.org',
});
```

#### revokeOrganizationInvitation(params)

Revoke a pending organization invitation for the organization specified by `organizationId`.

The requesting user must be an administrator in the organization.

The method parameters are:

- _organizationId_ The ID of the organization that the invitation belongs to.
- _invitationId_ The ID of the pending organization invitation to be revoked.
- _requestingUserId_ The ID of the user that revokes the invitation. Must be an administrator.

```ts
const invitation = await clerkAPI.organizations.revokeOrganizationInvitation({
  organizationId: 'org_1o4q123qMeCkKKIXcA9h8',
  invitationId: 'orginv_4o4q9883qMeFggTKIXcAArr',
  requestingUserId: 'user_1o4q123qMeCkKKIXcA9h8',
});
```

#### getOrganizationMembershipList(params)

Get a list of memberships for the organization with the provided `organizationId`.

The method supports pagination via optional `limit` and `offset` parameters. The method parameters are:

- _organizationId_ The unique ID of the organization to retrieve the memberships for
- _limit_ Optionally put a limit on the number of results returned
- _offset_ Optionally skip some results

```js
const memberships = await clerkAPI.organizations.getOrganizationMemberships({
  organizationId: 'org_1o4q123qMeCkKKIXcA9h8',
});
```

#### createOrganizationMembership(params)

Create a membership for the organization specified by `organizationId`. Effectively adds a user to an organization.

Available parameters:

- _organizationId_ The ID of the organization to add a member to.
- _userId_ The ID of the user that will be added to the organization.
- _role_ The role of the new member in the organization

```js
const membership = await clerkAPI.organizations.createOrganizationMembership({
  organizationId: 'org_1o4q123qMeCkKKIXcA9h8',
  userId: 'user_1o4q123qMeCkKKIXcA9h8',
  role: 'basic_member',
});
```

#### updateOrganizationMembership(params)

Updates the organization membership of the user with `userId` for the organization with `organizationId`.

Available parameters:

- _organizationId_ The ID of the organization that the membership belongs to.
- _userId_ The ID of the user who's a member of the organization.
- _role_ The role of the organization member.

```js
const membership = await clerkAPI.organizations.updateOrganizationMembership({
  organizationId: 'org_1o4q123qMeCkKKIXcA9h8',
  userId: 'user_1o4q123qMeCkKKIXcA9h8',
  role: 'admin',
});
```

#### deleteOrganizationMembership(params)

Deletes an organization membership, specified by the `organizationId` and `userId` parameters.

```js
const membership = await clerkAPI.organizations.deleteOrganizationMembership({
  organizationId: 'org_1o4q123qMeCkKKIXcA9h8',
  userId: 'user_1o4q123qMeCkKKIXcA9h8',
});
```

## Redirect URLs operations

Redirect URLs endpoints are used to whitelist URLs for native application authentication flows such as OAuth sign-ins and sign-ups in [React Native](https://clerk.dev/docs/reference/clerk-expo) and [Expo](https://clerk.dev/docs/reference/clerk-expo).

Redirect URL operations are exposed by the `redirectUrls` sub-api (`clerkAPI.redirectUrls`).

#### createRedirectUrl({ url })

Creates a new redirect URL:

```ts
const redirectUrl = await clerkAPI.redirectUrls.createRedirectUrl({ url });
```

#### getRedirectUrlList()

Get the list of all redirect URLs:

```ts
const redirectUrlList = await clerkAPI.redirectUrls.getRedirectUrlList();
```

#### getRedirectUrl(redirectUrlId)

Retrieve a redirect URL:

```ts
const redirectUrl = await clerkAPI.redirectUrls.getRedirectUrl('redirect_url_test');
```

#### deleteRedirectUrl(redirectUrlId)

Delete a redirect URL:

```ts
await clerkAPI.redirectUrls.deleteRedirectUrl('redirect_url_test');
```

## Session operations

Session operations are exposed by the `sessions` sub-api (`clerkAPI.sessions`).

#### getSessionList({ clientId, userId })

Retrieves the list of sessions:

```ts
const sessions = await clerkAPI.sessions.getSessionList();
```

Can also be filtered by a given client id, user id, or both:

```ts
const clientId = 'my-client-id';
const userId = 'my-user-id';
const sessions = await clerkAPI.sessions.getSessionList({
  clientId,
  sessionId,
});
```

#### getSession(sessionId)

Retrieves a single session by its id, if the id is valid. Throws an error otherwise.

```ts
const session = await clerkAPI.sessions.getSession(sessionId);
```

#### revokeSession(sessionId)

Revokes a session given its id, if the id is valid. Throws an error otherwise.

User will be signed out from the particular client the referred to.

```ts
const sessionId = 'my-session-id';
const session = await clerkAPI.sessions.revokeSession(sessionId);
```

#### verifySession(sessionId, sessionToken)

Verifies whether a session with a given id corresponds to the provided session token. Throws an error if the provided id is invalid.

```ts
const sessionId = 'my-session-id';
const sessionToken = 'my-session-token';
const session = await clerkAPI.sessions.verifySession(sessionId, sessionToken);
```

## Sign in token operations

Generate a token for an existing user to sign in without him needing to apply any first-factor type authentication.

_Second-factor type inputs would still need to be filled._

#### createSignInToken(params)

Creates a sign in token:

```ts
const signInToken = await clerkAPI.signInTokens.createSignInToken({ userId: 'user_test_id', expiresInSeconds: 60 });
```

#### revokeSignInToken(signInTokenId)

Revokes an issued sign in token.

```ts
await clerkAPI.signInTokens.revokeSignInToken('token_test_id');
```

## User operations

User operations are exposed by the `users` sub-api (`clerkAPI.users`).

#### getUserList()

Retrieves user list:

```ts
const users = await clerkAPI.users.getUserList();
```

Retrieves user list that is ordered and filtered by the number of results:

```ts
const sessions = await clerkAPI.users.getUserList({
  orderBy: '-created_at',
  limit: 10,
});
```

Retrieves user list that is filtered by the given email addresses and phone numbers:

```ts
const emailAddress = ['email1@clerk.dev', 'email2@clerk.dev'];
const phoneNumber = ['+12025550108'];
const sessions = await clerk.users.getUserList({ emailAddress, phoneNumber });
```

If these filters are included, the response will contain only users that own any of these emails and/or phone numbers.

#### getUser(userId)

Retrieves a single user by their id, if the id is valid. Throws an error otherwise.

```ts
const userId = 'my-user-id';
const user = await clerkAPI.users.getUser(userId);
```

#### createUser(params)

Creates a user. Your user management settings determine how you should setup your user model.

Any email address and phone number created using this method will be automatically marked as verified.

Available parameters are:

- _externalId_ The ID of the user you use in in your external systems. Must be unique across your instance.
- _emailAddress[]_ Email addresses to add to the user. Must be unique across your instance. The first email address will be set as the users primary email address.
- _phoneNumber[]_ Phone numbers that will be added to the user. Must be unique across your instance. The first phone number will be set as the users primary phone number.
- _username_ The username to give to the user. It must be unique across your instance.
- _password_ The plaintext password to give the user.
- _firstName_ User's first name.
- _lastName_ User's last name.
- _totpSecret_ User's secret for TOTP. Useful while migrating users with enabled 2FA Authenticator Apps.
- _publicMetadata_ Metadata saved on the user, that is visible to both your Frontend and Backend APIs.
- _privateMetadata_ Metadata saved on the user, that is only visible to your Backend API.
- _unsafeMetadata_ Metadata saved on the user, that can be updated from both the Frontend and Backend APIs. Note: Since this data can be modified from the frontend, it is not guaranteed to be safe.

#### updateUser(userId, params)

Updates a user with a given id with attribute values provided in a params object.

The provided id must be valid, otherwise an error will be thrown.

```ts
const userId = 'my-user-id';
const params = { firstName = 'John', lastName: 'Wick' }; // See below for all supported keys
const user = await clerkAPI.users.update(userId, params);
```

Supported user attributes for update are:

|       Attribute       |        Data type        |
| :-------------------: | :---------------------: |
|       firstName       |         string          |
|       lastName        |         string          |
|       password        |         string          |
| primaryEmailAddressID |         string          |
| primaryPhoneNumberID  |         string          |
|    publicMetadata     | Record<string, unknown> |
|    privateMetadata    | Record<string, unknown> |

#### deleteUser(userId)

Deletes a user given their id, if the id is valid. Throws an error otherwise.

```ts
const userId = 'my-user-id';
const user = await clerkAPI.users.deleteUser(userId);
```

#### disableUserMFA(userId)

Disables all MFA methods of a user given their id. Throws an error otherwise.

```ts
const userId = 'my-user-id';
await clerkAPI.users.disableUserMFA(userId);
```

## Email operations

Email operations are exposed by the `emails` sub-api (`clerkAPI.emails`).

#### createEmail({ fromEmailName, subject, body, emailAddressId })

Sends an email message to an email address id belonging to another user:

```ts
const fromEmailName = 'sales'; // i.e. the "sales" in sales@example.com
const subject = 'Free tacos';
const body = 'Join us via Zoom for remote Taco Tuesday!';
const emailAddressId = 'recipient-email-address-id';
const email = await clerkAPI.emails.createEmail({
  fromEmailName,
  subject,
  body,
  emailAddressId,
});
```

## SMS Message operations

SMS message operations are exposed by the `smsMessages` sub-api (`clerkAPI.smsMessages`).

#### createSMSMessage({ message, phoneNumberId })

Sends an SMS message to a phone number id belonging to another user:

```ts
const message = 'All glory to the Hypnotoad!';
const phoneNumberId = 'recipient-phone-number-id';
const smsMessage = await clerkAPI.smsMessages.createSMSMessage({
  message,
  phoneNumberId,
});
```

## Error handling

The error handling is pretty generic at the moment but more fine-grained errors are coming soon ™.
