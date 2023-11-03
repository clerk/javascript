<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_backend" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/backend

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_backend)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/backend/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://github.com/clerk/javascript/issues/new?assignees=&labels=feature-request&projects=&template=FEATURE_REQUEST.yml)
·
[Ask a Question](https://github.com/clerk/javascript/discussions)

</div>

---

## Overview

This package provides Clerk Backend API resources and low-level authentication utilities for JavaScript environments. It is mostly used as the base for other Clerk SDKs but it can be also used on its own.

### Features

- Built for V8 isolates (Cloudflare Workers, Vercel Edge Runtime, etc...).
- Make it isomorphic to work across all modern JS runtimes.
- Use options injection for all keys and settings.
- Support multiple CLERK_API_KEY for multiple instance REST access.
- Align JWT key resolution algorithm across all environments (Function param > Environment variable > JWKS from API).
- Tested automatically across different runtimes (Node, CF Workers, Vercel Edge middleware.)
- Clean up Clerk interstitial logic.
- Refactor the Rest Client API to return `{data, errors}` instead of throwing errors.
- Export a generic verifyToken for Clerk JWTs verification.
- Align AuthData interface for SSR.
- Export CJS and ESM.

## How to use

Works on Node >= 16 or on any V8 Isolates runtimes such as Cloudflare Workers.

```sh
npm install @clerk/backend
```

```
import { Clerk } from '@clerk/backend';

const clerk = Clerk({ apiKey: '...' });

await clerk.users.getUser("user_...");
```

### API

#### Clerk(options: ClerkOptions)

Create Clerk SDK that includes an HTTP Rest client for the Backend API and session verification helpers. The clerk object contains the following APIs and methods:

```js
import { Clerk } from '@clerk/backend';

const clerk = Clerk({ apiKey: '...' });

await clerk.users.getUser('user_...');

// Available APIs
clerk.allowlistIdentifiers;
clerk.clients;
clerk.emailAddresses;
clerk.emails;
clerk.interstitial;
clerk.invitations;
clerk.organizations;
clerk.phoneNumbers;
clerk.redirectUrls;
clerk.sessions;
clerk.signInTokens;
clerk.smsMessages;
clerk.users;

// These functions should be used by framework-specific libraries, such as @clerk/nextjs or @clerk/remix.

// Compute the authentication state given the request parameters.
clerk.authenticateRequest(options);

// Build debug payload of the request state.
clerk.debugRequestState(requestState);

// Load clerk interstitial from this package
clerk.localInterstitial(options);

// Load clerk interstitial from the public Backend API endpoint
clerk.remotePublicInterstitial(options);

// Load clerk interstitial from the public Private API endpoint (Deprecated)
clerk.remotePrivateInterstitial(options);
```

#### verifyToken(token: string, options: VerifyTokenOptions)

Verifies a Clerk generated JWT (i.e. Clerk Session JWT and Clerk JWT templates). The key resolution via JWKS or local values is handled automatically.

```js
import { verifyToken } from '@clerk/backend';

verifyToken(token, {
  issuer: '...',
  authorizedParties: '...',
});
```

#### verifyJwt(token: string, options: VerifyJwtOptions)

Verifies a Clerk generated JWT (i.e. Clerk Session JWT and Clerk JWT templates). The key needs to be provided in the options.

```js
import { verifyJwt } from '@clerk/backend';

verifyJwt(token, {
  key: JsonWebKey | string,
  issuer: '...',
  authorizedParties: '...',
});
```

#### decodeJwt(token: string)

Decodes a JWT.

```js
import { decodeJwt } from '@clerk/backend';

decodeJwt(token);
```

#### hasValidSignature(jwt: Jwt, key: JsonWebKey | string)

Verifies that the JWT has a valid signature. The key needs to be provided.

```js
import { hasValidSignature } from '@clerk/backend';

hasValidSignature(token, jwk);
```

#### debugRequestState(requestState)

Generates a debug payload for the request state

```js
import { debugRequestState } from '@clerk/backend';

debugRequestState(requestState);
```

#### loadInterstitialFromLocal(options)

Generates a debug payload for the request state. The debug payload is available via `window.__clerk_debug`.

```js
import { loadInterstitialFromLocal } from '@clerk/backend';

loadInterstitialFromLocal({
  frontendApi: '...',
  pkgVersion: '...',
  debugData: {},
});
```

#### signedInAuthObject(sessionClaims, options)

Builds the AuthObject when the user is signed in.

```js
import { signedInAuthObject } from '@clerk/backend';

signedInAuthObject(jwtPayload, options);
```

#### signedOutAuthObject()

Builds the empty AuthObject when the user is signed out.

```js
import { signedOutAuthObject } from '@clerk/backend';

signedOutAuthObject();
```

#### sanitizeAuthObject(authObject)

Removes sensitive private metadata from user and organization resources in the AuthObject

```js
import { sanitizeAuthObject } from '@clerk/backend';

sanitizeAuthObject(authObject);
```

#### prunePrivateMetadata(obj)

Removes any `private_metadata` and `privateMetadata` attributes from the object to avoid leaking sensitive information to the browser during SSR.

```js
import { prunePrivateMetadata } from '@clerk/backend';

prunePrivateMetadata(obj);
```

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Create a [GitHub Discussion](https://github.com/clerk/javascript/discussions)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_backend)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md).

## Security

`@clerk/backend` follows good practices of security, but 100% security cannot be assured.

`@clerk/backend` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/backend/LICENSE) for more information.
