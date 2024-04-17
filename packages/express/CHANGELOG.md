# Change Log

## 1.0.1-beta.3

### Patch Changes

- Updated dependencies [[`142ded732`](https://github.com/clerk/javascript/commit/142ded73265b776789b65404d96b6c91cfe15e98), [`fb794ce7b`](https://github.com/clerk/javascript/commit/fb794ce7b88001b98ad4a628bc2cc39a0c8ccfa5), [`e6fc58ae4`](https://github.com/clerk/javascript/commit/e6fc58ae4df5091eff00ba0d9045ce5ff0fff538)]:
  - @clerk/backend@1.0.0-beta.36
  - @clerk/shared@2.0.0-beta.22

## 1.0.1-beta.2

### Patch Changes

- Updated dependencies [[`7cb1241a9`](https://github.com/clerk/javascript/commit/7cb1241a9929b3d8a0d2157637734d82dd9fd852)]:
  - @clerk/backend@1.0.0-beta.35

## 1.0.1-beta.1

### Patch Changes

- Updated dependencies [[`ecb60da48`](https://github.com/clerk/javascript/commit/ecb60da48029b9cb2d17ab9b0a73cb92bc5c924b)]:
  - @clerk/backend@1.0.0-beta.34

## 1.0.1-beta.0

### Patch Changes

- Introduce [Express](https://expressjs.com/) specific Clerk SDK called `@clerk/express`. The SDK exposes the following APIs: ([#2918](https://github.com/clerk/javascript/pull/2918)) by [@dimkl](https://github.com/dimkl)

  - `clerkClient`: Default [`@clerk/backend`](https://clerk.com/docs/references/backend/overview) client initialized from environment variables and used to make backend API requests
  - `clerkMiddleware`: Centralized middleware that authenticates all requests without blocking them (also triggers handshake mechanism)
  - `getAuth`: Utility to retrieve the auth state from a request (requires `clerkMiddleware` to be executed)
  - `requireAuth`: Middleware that returns HTTP 401 response when request is signed-out

  Also all the top level exports from `@clerk/backend` are re-exported from `@clerk/express`.

- Updated dependencies [[`63dfe8dc9`](https://github.com/clerk/javascript/commit/63dfe8dc92c28213db5c5644782e7d6751fa22a6), [`d22e6164d`](https://github.com/clerk/javascript/commit/d22e6164ddb765542e0e6335421d2ebf484af059)]:
  - @clerk/backend@1.0.0-beta.33
