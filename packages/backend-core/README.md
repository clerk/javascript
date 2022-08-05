<p align="center">
  <a href="https://clerk.dev?utm_source=github&utm_medium=clerk_backend_core" target="_blank" rel="noopener noreferrer">
    <img src="https://images.clerk.dev/static/clerk.svg" alt="Clerk logo" height="50">
  </a>
  <br />
</p>

# @clerk/backend-code

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.com/invite/b5rXHjAg7A)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.dev/docs?utm_source=github&utm_medium=clerk_backend_core)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerkinc/javascript/blob/main/packages/backend-core/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=bug&template=bug_report.md&title=Bug%3A+)
·
[Request a Feature](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=Feature%3A+)
·
[Ask a Question](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)

</div>

---

## Overview

This package provides Clerk Backend API core resources and low-level authentication utilities for JavaScript environments. It is mostly used as the base for other Clerk SDKs.

## Getting Started

### Installation

```sh
npm install @clerk/backend-core
```

### Build

To build the package locally with the TypeScript compiler, run:

```sh
npm run build
```

## Architecture

`@clerk/backend-core` contains all the logic for basic Clerk functionalities, without being platform/environment, specific such as:

- Determining the authentication state of a session.
- Validating a Clerk token state.
- Clerk API resource management.

### How it works

This package is used as the base building block for Clerk JavaScript SDKs and environments. This is achieved by providing all the required business logic if only a few environment-specific utilities are implemented by the client.

<p align="center">
  <a href="https://clerk.dev/" target="_blank" align="center">
    <img src="https://images.clerk.dev/static/backend_api_architecture.png" height="350">
  </a>
  <br />
</p>

In essence, the client should supply these key functions in the Clerk [Base](./src/Base.ts#47) and [ClerkBackendApi](./src/api/ClerkBackendApi.ts) classes:

1. Public key import `importKeyFunction`.
2. JWT signature verification `verifySignatureFunction`.
3. Base64 decoding `decodeBase64Function`.
4. HTTP fetching utility for the API resource management `ClerkFetcher`.

After supplying those in the `Base` and `ClerkBackendApi` classes, you can use all the Clerk utilities required for the SDK business logic.

## Usage

### Creating a Base for a new SDK

```ts
const importKey = async (jwk: JsonWebKey, algorithm: Algorithm) => {
  //  ...
};

const verifySignature = async (algorithm: Algorithm, key: CryptoKey, signature: Uint8Array, data: Uint8Array) => {
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
const authorizedParties = ['http://localhost:3000', 'https://example.com'];

examplePlatformBase.verifySessionToken(token > { authorizedParties });
```

### Clerk API Resources

API resource management is also provided by this package through the [ClerkBackendApi](./src/api/ClerkBackendApi.ts) class. For more information on the API resources you can checkout the [resource documentation page](https://reference.clerk.dev/reference/backend-api-reference).

To use the Clerk Backend API wrapper in any JavaScript platform, you would need to provide some specific SDK information and an HTTP fetching utility. See more at the [ClerkBackendAPIProps](./src/api/ClerkBackendApi.ts#17) implementation.

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://discord.com/invite/b5rXHjAg7A)
- Open a [GitHub support issue](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)
- Contact options listed on [our Support page](https://clerk.dev/support?utm_source=github&utm_medium=clerk_backend_core)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerkinc/javascript/blob/main/packages/backend-core/docs/CONTRIBUTING.md).

## Security

`@clerk/backend-core` follows good practices of security, but 100% security cannot be assured.

`@clerk/backend-core` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerkinc/javascript/blob/main/packages/backend-core/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerkinc/javascript/blob/main/packages/backend-core/LICENSE) for more information.
