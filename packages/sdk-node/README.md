<p align="center">
  <a href="https://clerk.dev/" target="_blank" align="center">
    <img src="https://images.clerk.dev/static/clerk.svg" height="50">
  </a>
  <br />
</p>

# Clerk Node.js SDK

Thank you for choosing [Clerk](https://clerk.dev/) for your authentication, session & user management needs!

This SDK allows you to call the Clerk server API from node / JS / TS code without having to implement the calls
yourself.

To gain a better understanding of the underlying API calls the SDK makes, feel free to consult
the <a href="https://docs.clerk.dev/reference/backend-api-reference" target="_blank">official Clerk server API documentation</a>.

## Table of contents

- [Internal implementation details](#internal-implementation-details)
- [Installation](#installation)
- [Resource types](#resource-types)
- [Usage](#usage)
  - [Options & ENV vars available](#options--env-vars-available)
    - [tl;dr](#tldr)
    - [Full option reference](#full-option-reference)
    - [httpOptions](#httpoptions)
  - [Singleton](#singleton)
    - [ESM](#esm)
    - [CJS](#cjs)
    - [Setters](#setters)
  - [Custom instantiation](#custom-instantiation)
    - [ESM](#esm)
    - [CJS](#cjs)
  - [Examples](#examples)
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
- [Express middleware](#express-middleware)
  - [onError option](#onerror-option)
  - [Express Error Handlers](#express-error-handlers)
- [Next](#next)
- [Troubleshooting](#troubleshooting)
- [Feedback / Issue reporting](#feedback--issue-reporting)

Internal implementation details

This project is written in <a href="https://www.typescriptlang.org/" target="_blank">TypeScript</a> and built
with <a href="https://github.com/formium/tsdx" target="_blank">tsdx</a>.

CJS, ESM, and UMD module builds are provided.

The http client used by the sdk is <a href="https://github.com/sindresorhus/got" target="_blank">got</a>.

All resource operations are mounted as sub-APIs on a `Clerk` class and return promises that either resolve with their
expected resource types or reject with the error types described below.

The sub-APIs are also importable directly if you don't want to go through the `Clerk` class.

## Installation

Using yarn:

`yarn add @clerk/clerk-sdk-node`

Using npm:

`npm install @clerk/clerk-sdk-node --save`

## Resource types

The following types are of interest to the integrator:

| Resource    | Description                                  |
| ----------- | -------------------------------------------- |
| Client      | unique browser or mobile app                 |
| Session     | a session for a given user on a given client |
| User        | a person signed up via Clerk                 |
| Email       | an email message sent to another user        |
| SMS Message | an SMS message sent to another user          |

The following types are not directly manipulable but can be passed as params to applicable calls:

| Resource     | Description                                                           | Usage                                                                             |
| ------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| EmailAddress | email address, a user may have a primary & several secondary          | email address id can be provided to `emails` sub-api to specify the recipient     |
| PhoneNumber  | E.164 telephone number, a user may have a primary & several secondary | phone number id can be provided to `smsMessages` sub-api to specify the recipient |

## Usage

### Options & ENV vars available

#### tl;dr

If you set `CLERK_API_KEY` in your environment you are good to go.

#### Full option reference

The following options are available for you to customize the behaviour of the `Clerk` class.

Note that most options can also be set as ENV vars so that you don't need to pass anything to the constructor or set it
via the available setters.

| Option       | Description                                                                                   | Default                              | ENV variable        |
| ------------ | --------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------- |
| apiKey       | server key for api.clerk.dev                                                                  | none                                 | `CLERK_API_KEY`     |
| apiVersion   | for future use, v1 for now                                                                    | "v1"                                 | `CLERK_API_VERSION` |
| serverApiURL | for debugging / future use                                                                    | "<span>http</span>s://api.clerk.dev" | `CLERK_API_URL`     |
| httpOptions  | <a href="https://github.com/sindresorhus/got#options" target="_blank">http client options</a> | {}                                   | N/A                 |

For every option the resolution is as follows, in order of descending precedence:

1. option passed
2. ENV var (if applicable)
3. default

Another available environment variable is `CLERK_LOGGING`.

You can set its value to `true` to enable additional logging that may be of use when debugging an issue.

#### httpOptions

The SDK allows you to pass options to the underlying http client (got) by instantiating it with an
additional `httpOptions` object.

e.g. to pass a custom header:

```ts
const sdk = new Clerk(apiKey, { httpOptions: headers: {
		'x-unicorn': 'rainbow'
	}});
```

You can check the options the got client supports <a href="https://github.com/sindresorhus/got#options" target="_blank">here</a>.

### Singleton

If you are comfortable with setting the `CLERK_API_KEY` ENV variable and be done with it, the default instance created
by the SDK will suffice for your needs.

#### ESM

```ts
import clerk from '@clerk/clerk-sdk-node';
const userList = await clerk.users.getUserList();
```

Or if you are interested only in a certain resource:

```ts
import { sessions } from '@clerk/clerk-sdk-node';
const sessionList = await sessions.getSessionList();
```

#### CJS

```ts
const pkg = require('@clerk/clerk-sdk-node');
const clerk = pkg.default;

clerk.emails
  .createEmail({ fromEmailName, subject, body, emailAddressId })
  .then((email) => console.log(email))
  .catch((error) => console.error(error));
```

Or if you prefer a resource sub-api directly:

```ts
const pkg = require('@clerk/clerk-sdk-node');
const { clients } = pkg;

clients
  .getClient(clientId)
  .then((client) => console.log(client))
  .catch((error) => console.error(error));
```

#### Setters

The following setters are available for you to change the options even after you've obtained a handle on a `Clerk` or
sub-api instance:

If you have a `clerk` handle:

- `clerk.apiKey = value`;
- `clerk.serverApiUrl = value`;
- `clerk.apiVersion = value`;
- `clerk.httpOptions = value`;

If are using a sub-api handle and wish to change options on the (implicit) singleton `Clerk` instance:

- `setClerkApiKey(value)`
- `setClerkServerApiUrl(value)`
- `setClerkApiVersion(value)`
- `setClerkHttpOptions(value)`

### Custom instantiation

If you would like to use more than one `Clerk` instance, e.g. if you are using multiple api keys or simply prefer the
warm fuzzy feeling of controlling instantiation yourself:

#### ESM

```ts
import Clerk from '@clerk/clerk-sdk-node/instance';

const clerk = new Clerk({ apiKey: 'top-secret' });

const clientList = await clerk.clients.getClientList();
```

#### CJS

```ts
const Clerk = require('@clerk/clerk-sdk-node/instance').default;

const clerk = new Clerk({ apiKey: 'your-eyes-only' });

clerk.smsMessages
  .createSMSMessage({ message, phoneNumberId })
  .then((smsMessage) => console.log(smsMessage))
  .catch((error) => console.error(error));
```

### Examples

You also consult the [examples folder](https://github.com/clerkinc/clerk-sdk-node/tree/main/examples) for further hints
on usage.

### Allowlist operations

Allowlist operations are exposed by the `allowlistIdentifiers` sub-api (`clerk.allowlistIdentifiers`).

#### getAllowlistIdentifierList()

Retrieves the list of allowlist identifiers.

```ts
const allowlistIdentifiers =
  await clerk.allowlistIdentifiers.getAllowlistIdentifierList();
```

#### createAllowlistIdentifier(params)

Adds a new identifier to the allowlist.

Accepts an `identifier` parameter, which can be:

- A phone number in international ([E.164](https://en.wikipedia.org/wiki/E.164)) format.
- An email address.
- A wildcard email address (`*.domain.com`). Use this `identifier` value to allow any email address in a particular email domain.

You can also control if you want to notify the owner of the `identifier`, by setting the `notify` property to `true`. The `notify` property is not available for wildcard identifiers.

```ts
const allowlistIdentifier = await createAllowlistIdentifier({
  identifier: 'test@example.com',
  notify: false,
});
```

#### deleteAllowlistIdentifier(allowlistIdentifierId)

Deletes an allowlist identifier, specified by the `allowlistIdentifierId` parameter. Throws an error if the `allowlistIdentifierId` parameter is invalid.

```ts
await deleteAllowlistIdentifier('alid_randomid');
```

### Client operations

Client operations are exposed by the `clients` sub-api (`clerk.clients`).

#### getClientList()

Retrieves the list of clients:

```ts
const clients = await clerk.clients.getClientList();
```

#### getClient(clientId)

Retrieves a single client by its id, if the id is valid. Throws an error otherwise.

```ts
const clientID = 'my-client-id';
const client = await clerk.clients.getClient(clientId);
```

#### verifyClient(sessionToken)

Retrieves a client for a given session token, if the session is active:

```ts
const sessionToken = 'my-session-token';
const client = await clerk.clients.verifyClient(sessionToken);
```

### Invitation operations

Invitation operations are exposed by the `invitations` sub-api (`clerk.invitations`).

#### getInvitationList()

Retrieves a list of all non-revoked invitations for your application, sorted by descending creation date.

```ts
const invitations = await clerk.invitations.getInvitationList();
```

#### createInvitation(params)

Creates a new invitation for the given email address and sends the invitation email.

Keep in mind that you cannot create an invitation if there is already one for the given email address. Also, trying to create an invitation for an email address that already exists in your application will result in an error.

You can optionally pass a `redirectUrl` parameter when creating the invitation and the invitee will be redirected there after they click the invitation email link.

```js
const invitation = await clerk.invitations.createInvitation({
  emailAddress: 'invite@example.com',
  redirectUrl: 'https://optionally-redirect-here',
});
```

#### revokeInvitation(invitationId)

Revokes the invitation with the provided `invitationId`. Throws an error if `invitationId` is invalid.

Revoking an invitation makes the invitation email link unusable. However, it doesn't prevent the user from signing up if they follow the sign up flow.

Only active (i.e. non-revoked) invitations can be revoked.

```js
const invitation = await clerk.invitations.revokeInvitation('inv_some-id');
```

### Session operations

Session operations are exposed by the `sessions` sub-api (`clerk.sessions`).

#### getSessionList({ clientId, userId })

Retrieves the list of sessions:

```ts
const sessions = await clerk.sessions.getSessionList();
```

Can also be filtered by a given client id, user id, or both:

```ts
const clientId = 'my-client-id';
const userId = 'my-user-id';
const sessions = await clerk.sessions.getSessionList({ clientId, sessionId });
```

#### getSession(sessionId)

Retrieves a single session by its id, if the id is valid. Throws an error otherwise.

```ts
const session = await clerk.sessions.getSession(sessionId);
```

#### revokeSession(sessionId)

Revokes a session given its id, if the id is valid. Throws an error otherwise.

User will be signed out from the particular client the referred to.

```ts
const sessionId = 'my-session-id';
const session = await clerk.sessions.revokeSession(sessionId);
```

#### verifySession(sessionId, sessionToken)

Verifies whether a session with a given id corresponds to the provided session token. Throws an error if the provided id is invalid.

```ts
const sessionId = 'my-session-id';
const sessionToken = 'my-session-token';
const session = await clerk.sessions.verifySession(sessionId, sessionToken);
```

### User operations

User operations are exposed by the `users` sub-api (`clerk.users`).

#### getUserList()

Retrieves user list:

```ts
const users = await clerk.users.getUserList();
```

Retrieves user list that is ordered and filtered by the number of results:

```ts
const sessions = await clerk.users.getUserList({
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
const user = await clerk.users.getUser(userId);
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
const user = await clerk.users.update(userId, params);
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
const user = await clerk.users.deleteUser(userId);
```

### Email operations

Email operations are exposed by the `emails` sub-api (`clerk.emails`).

#### createEmail({ fromEmailName, subject, body, emailAddressId })

Sends an email message to an email address id belonging to another user:

```ts
const fromEmailName = 'sales'; // i.e. the "sales" in sales@example.com
const subject = 'Free tacos';
const body = 'Join us via Zoom for remote Taco Tuesday!';
const emailAddressId = 'recipient-email-address-id';
const email = await clerk.emails.createEmail({
  fromEmailName,
  subject,
  body,
  emailAddressId,
});
```

### SMS Message operations

SMS message operations are exposed by the `smsMessages` sub-api (`clerk.smsMessages`).

#### createSMSMessage({ message, phoneNumberId })

Sends an SMS message to a phone number id belonging to another user:

```ts
const message = 'All glory to the Hypnotoad!';
const phoneNumberId = 'recipient-phone-number-id';
const smsMessage = await clerk.smsMessages.createSMSMessage({
  message,
  phoneNumberId,
});
```

## Error handling

The error handling is pretty generic at the moment but more fine-grained errors are coming soon ™.

## Express middleware

For usage with <a href="https://github.com/expressjs/express" target="_blank">Express</a>, this package also exports `ClerkExpressWithSession` (lax) & `ClerkExpressRequireSession` (strict)
middlewares that can be used in the standard manner:

```ts
import { ClerkWithSession } from '@clerk/clerk-sdk-node';

// Initialize express app the usual way

app.use(ClerkWithSession());
```

The `ClerkWithSession` middleware will set the Clerk session on the request object as `req.session` and then call the next middleware.

You can then implement your own logic for handling a logged-in or logged-out user in your express endpoints or custom
middleware, depending on whether your users are trying to access a public or protected resource.

If you want to use the express middleware of your custom `Clerk` instance, you can use:

```ts
app.use(clerk.expressWithSession());
```

Where `clerk` is your own instance.

If you prefer that the middleware renders a 401 (Unauthenticated) itself, you can use the following variant instead:

```ts
import { ClerkExpressRequireSession } from '@clerk/clerk-sdk-node';

app.use(ClerkExpressRequireSession());
```

### onError option

The Express middleware supports an `options` object as an optional argument.
The only key currently supported is `onError` for providing your own error handler.

The `onError` function, if provided, should take an `Error` argument (`onError(error)`).

Depending on the return value, it can affect the behavior of the middleware as follows:

- If an `Error` is returned, the middleware will call `next(err)` with that error. If the `err` has a `statusCode` it will indicate to Express what HTTP code the response should have.
- If anything other than an `Error` is returned (or nothing is returned at all), then the middleware will call `next()` without arguments

The default implementations unless overridden are:

```ts
// defaultOnError swallows the error
defaultOnError(error: Error) {
  console.error(error.message);
}

// strictOnError returns the error so that Express will halt the request chain
strictOnError(error: Error) {
  console.error(error.message);
  return error;
}
```

`defaultOnError` is used in the lax middleware variant and `strictOnError` in the strict variant.

### Express Error Handlers

Not to be confused with the `onError` option mentioned above, Express comes with a default error handler for errors encountered in the middleware chain.

Developers can also implement their own custom error handlers as detailed <a href="https://expressjs.com/en/guide/error-handling.html" target="_blank">here</a>.

An example error handler can be found in the [Express examples folder](https://github.com/clerkinc/clerk-sdk-node/tree/main/examples/express):

```js
// Note: this is just a sample errorHandler that pipes clerk server errors through to your API responses
// You will want to apply different handling in your own app to avoid exposing too much info to the client
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const body = err.data || { error: err.message };

  res.status(statusCode).json(body);
}
```

If you are using the strict middleware variant, the `err` pass to your error handler will contain enough context for you to respond as you deem fit.

## Next

The current package also offers a way of making
your <a href="https://nextjs.org/docs/api-routes/api-middlewares" target="_blank">Next.js api middleware</a> aware of the Clerk Session.

You can define your handler function with the usual signature (`function handler(req, res) {}`) then wrap it
with `withSession`:

```ts
import { withSession, WithSessionProp } from '@clerk/clerk-sdk-node';
```

Note: Since the request will be extended with a session property, the signature of your handler in TypeScript would be:

```ts
function handler(req: WithSessionProp<NextApiRequest>, res: NextApiResponse) {
    if (req.session) {
        // do something with session.userId
    } else {
        // Respond with 401 or similar
    }
}

export withSession(handler);
```

You can also pass an `onError` handler to the underlying Express middleware that is called (see previous section):

```ts
export withSession(handler, { clerk, onError: error => console.log(error) });
```

In case you would like the request to be rejected automatically when no session exists,
without having to implement such logic yourself, you can opt for the stricter variant:

```ts
import clerk, {
  requireSession,
  RequireSessionProp,
} from '@clerk/clerk-sdk-node';
```

In this case your handler can be even simpler because the existence of the session can be assumed, otherwise the
execution will never reach your handler:

```ts
function handler(req: RequireSessionProp<NextApiRequest>, res: NextApiResponse) {
    // do something with session.userId
}

export requireSession(handler, { clerk, onError });
```

Note that by default the error returned will be the Clerk server error encountered (or in case of misconfiguration, the error raised by the SDK itself).

If you wish to have more control over what error code & message to respond with in this case, it's recommended to implement your own error class & handler as follows:

```ts
export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, HttpError.prototype);

    this.statusCode = statusCode;
  }
}

export function onError(error: Error) {
  // Ignore passed error, return a 401
  console.log(error);
  return new HttpError('Unauthorized', 401);
}
```

The aforementioned usage pertains to the singleton case. If you would like to use a `Clerk` instance you instantiated
yourself (e.g. named `clerk`), you can use the following syntax instead:

```ts
export clerk.withSession(handler);
// OR
export clerk.requireSession(handler);
```

## Validate the Authorized Party of a session token
Clerk's JWT session token, contains the azp claim, which equals the Origin of the request during token generation. You can provide the middlewares with a list of whitelisted origins to verify against, to protect your application of the subdomain cookie leaking attack. You can find an example below:

### Express

```ts
import { ClerkExpressRequireSession } from '@clerk/clerk-sdk-node';

const authorizedParties = ['http://localhost:3000', 'https://example.com']

app.use(ClerkExpressRequireSession({ authorizedParties }));
```

### Next

```ts
const authorizedParties = ['http://localhost:3000', 'https://example.com']

function handler(req: RequireSessionProp<NextApiRequest>, res: NextApiResponse) {
  // do something with session.userId
}

export requireSession(handler, { authorizedParties });
```

## Troubleshooting

Especially when using the middlewares, a number of common issues may occur.

Please consult the following check-list for some potential quick fixes:

- Is the `CLERK_API_KEY` set in your environment?
- In case you are using multiple Clerk apps or instances thereof (i.e. development, staging, production), ensure you are using the API key for the correct Clerk instance.
- If you are handling instantiation of the Clerk object yourself, are you passing your server API key to the constructor via the `apiKey` option?
- In development mode, do your frontend & API reside on the same domain? Unless the clerk `__session` is sent to your API server, the SDK will fail to authenticate your user.
- If you are still experiencing issues, it is advisable to set the `CLERK_LOGGING` environment variable to `true` to get additional logging output that may help identify the issue.

Note: The strict middleware variants (i.e. the "require session" variants) will produce an erroneous response if the user is not signed in.
Please ensure you are not mounting them on routes that are meant to be publicly accessible.

## Publishing

There are two ways to publish the package:

1. Run the `publishPackage` [script](./scripts/publish.js) supplying the bump type you wish to do and the changes will happen automatically. Supported ones are `major|minor|patch`.
   E.g. `yarn publishPackage minor`.
2. Run the steps described in the [publish script](./scripts/publish.js) manually step by step.

## Feedback / Issue reporting

Please report issues or open feature request in
the [github issue section](https://github.com/clerkinc/clerk-sdk-node/issues).
