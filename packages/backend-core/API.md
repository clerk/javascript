# Clerk Backend API Resource reference

Reference of the methods supported in the Clerk Backend API wrapper. [API reference](https://docs.clerk.dev/reference/backend-api-reference/)

```diff
! All methods should be called from a [ClerkBackendAPI](./src/api/ClerkBackendAPI.ts) instance.
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
  - [revokeInvitation(invitationId)](#revokeinvitationinvitationId)
- [Session operations](#session-operations)
  - [getSessionList({ clientId, userId })](#getsessionlist-clientid-userid-)
  - [getSession(sessionId)](#getsessionsessionid)
  - [revokeSession(sessionId)](#revokesessionsessionid)
  - [verifySession(sessionId, sessionToken)](#verifysessionsessionid-sessiontoken)
- [User operations](#user-operations)
  - [getUserList()](#getuserlist)
  - [getUser(userId)](#getuseruserid)
  - [createUser(params)](#createuserparams)
  - [updateUser(userId, params)](#updateuseruserid-params)
  - [deleteUser(userId)](#deleteuseruserid)
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
const allowlistIdentifiers =
  await clerkAPI.allowlistIdentifiers.getAllowlistIdentifierList();
```

#### createAllowlistIdentifier(params)

Adds a new identifier to the allowlist.

Accepts an `identifier` parameter, which can be:

- A phone number in international ([E.164](https://en.wikipedia.org/wiki/E.164)) format.
- An email address.
- A wildcard email address (`*.domain.com`). Use this `identifier` value to allow any email address in a particular email domain.

You can also control if you want to notify the owner of the `identifier`, by setting the `notify` property to `true`. The `notify` property is not available for wildcard identifiers.

```ts
const allowlistIdentifier =
  await clerkAPI.allowlistIdentifiers.createAllowlistIdentifier({
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
