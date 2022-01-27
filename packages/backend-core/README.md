<p align="center">
  <a href="https://clerk.dev/" target="_blank" align="center">
    <img src="https://images.clerk.dev/static/clerk.svg" height="50">
  </a>
  <br />
</p>

# Clerk Backend Core SDK

_Core Clerk API resources and authentication utilities for JavaScript environments._

```diff
! This package provides low-level utilities and is mostly used as the base for other Clerk SDKs.
```

## Usage

```sh
npm install @clerk/backend-core
# or
yarn add @clerk/backend-core
```

## Architecture

`@clerk/backend-core` contains all the logic for basic Clerk functionalities such as:

- Determining the authentication state of a session.
- Validating a Clerk token state.
- Clerk API resource management.

without being platform/environment specific.

### How it works

This package is used as the base building block for Clerk JavaScript SDKs and environments. This is achieved by providing all the required business logic if only a few environment-specific utilities are implemented by the client.

<p align="center">
  <a href="https://clerk.dev/" target="_blank" align="center">
    <img src="https://images.clerk.dev/static/backend_api_architecture.png" height="350">
  </a>
  <br />
</p>

In essence, the client should supply these key functions in the Clerk [Base](./src/Base.ts#47) and [ClerkBackendAPI](./src/api/ClerkBackendAPI.ts) classes:

1. Public key import `importKeyFunction`.
2. JWT signature verification `verifySignatureFunction`.
3. Base64 decoding `decodeBase64Function`.
4. HTTP fetching utility for the API resource management `ClerkFetcher`.

After supplying those in the `Base` and `ClerkBackendAPI` classes, you can use all the Clerk utilities required for the SDK business logic.

### Creating a Base for a new SDK

```ts
const importKey = async (jwk: JsonWebKey, algorithm: Algorithm) => {
  //  ...
};

const verifySignature = async (
  algorithm: Algorithm,
  key: CryptoKey,
  signature: Uint8Array,
  data: Uint8Array
) => {
  // ...
};

const decodeBase64 = (base64: string) => {
  // ...
};

/** Base initialization */

const examplePlatformBase = new Base(importKey, verifySignature, decodeBase64);
```

After creating the `Base` instance you can use core functions such as:

```ts
examplePlatformBase.verifySessionToken(...);

examplePlatformBase.getAuthState(...);
```

The `Base` utilities include the building blocks for developing any extra logic and middleware required for the target platform.

### Validate the Authorized Party of a session token
Clerk's JWT session token, contains the azp claim, which equals the Origin of the request during token generation. You can provide a list of whitelisted origins to verify against, during every token verification, to protect your application of the subdomain cookie leaking attack. You can find an example below:

```ts
const authorizedParties = ['http://localhost:3000', 'https://example.com']

examplePlatformBase.verifySessionToken(token> { authorizedParties });
```

### Clerk API Resources

API resource management is also provided by this package through the [ClerkBackendAPI](./src/api/ClerkBackendAPI.ts) class. For more information on the API resources you can checkout the [resource documentation page](https://docs.clerk.dev/reference/backend-api-reference).

To use the Clerk Backend API wrapper in any JavaScript platform, you would need to provide some specific SDK information and an HTTP fetching utility. See more at the [ClerkBackendAPIProps](./src/api/ClerkBackendAPI.ts#17) implementation.
