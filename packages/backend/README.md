<p align="center">
  <a href="https://clerk.dev?utm_source=github&utm_medium=clerk_backend_core" target="_blank" rel="noopener noreferrer">
    <img src="https://images.clerk.dev/static/clerk.svg" alt="Clerk logo" height="50">
  </a>
  <br />
</p>

# @clerk/backend

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.com/invite/b5rXHjAg7A)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.dev/docs?utm_source=github&utm_medium=clerk_backend_core)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerkinc/javascript/blob/main/packages/backend/CHANGELOG.md)
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
npm install @clerk/backend
```

### Build

To build the package locally with the TypeScript compiler, run:

```sh
npm run build -w @clerk/backend
```

## API

This package exports the following methods:

### Clerk Backend API HTTP client

**createBackendApiClient(options?: ClerkBackendAPIOptions)**

Creates a Clerk Backend API to consume the RestFul API client

### Token verification

**function getAuthState(options: AuthStateOptions)**

Compute the authState from the request parameters

**loadInterstitialFromLocal()**

Return the interstitial HTML as a string

**loadInterstitialFromBAPI(options: LoadInterstitialOptions)**

Return the interstitial HTML from Backend API

**verifyToken(token: string, options: VerifyTokenOptions)**

Verifies any Clerk generated JWT. The key resolution (via JWKS or local environment variables) is done automatically.

**verifyJwt(token: string, options: VerifyJwtOptions)**

Verified any Clerk generated JWT. The key needs to be provided.

**decodeJwt(token: string)**

Decodes any Clerk generaterd JWT

**hasValidSignature(jwt: Jwt, jwk: JsonWebKey)**

Verified that the JWT has a valid signature

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerkinc/javascript/blob/main/packages/backend/LICENSE) for more information.
