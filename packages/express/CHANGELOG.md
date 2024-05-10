# Change Log

## 0.0.6

### Patch Changes

- Updated dependencies [[`b92402258`](https://github.com/clerk/javascript/commit/b924022580569c934a9d33310449b4a50156070a)]:
  - @clerk/backend@1.1.3

## 0.0.5

### Patch Changes

- Updated dependencies [[`4f4375e88`](https://github.com/clerk/javascript/commit/4f4375e88fa2daae4d725c62da5e4cf29302e53c), [`1662aaae9`](https://github.com/clerk/javascript/commit/1662aaae965fcf36b13dba6b148e096ab6a1cd83), [`f70c885f7`](https://github.com/clerk/javascript/commit/f70c885f798f7ff513f6687f87c8a56daf26fa05), [`4ae79af36`](https://github.com/clerk/javascript/commit/4ae79af36552aae1f0284ecc4dfcfc23ef295d26), [`f5804a225`](https://github.com/clerk/javascript/commit/f5804a225e9d67cd315700f0ced0ff17b8b14e53)]:
  - @clerk/backend@1.1.2
  - @clerk/shared@2.0.2

## 0.0.4

### Patch Changes

- Updated dependencies [[`8fbe23857`](https://github.com/clerk/javascript/commit/8fbe23857bc588a4662af78ee33b24123cd8bc2e), [`a78bc447c`](https://github.com/clerk/javascript/commit/a78bc447c1aabaa41bcbaa2a8fe3c48f31275574), [`19cd42434`](https://github.com/clerk/javascript/commit/19cd42434450e568998336bf6d705e475122abbc)]:
  - @clerk/backend@1.1.1
  - @clerk/shared@2.0.1

## 0.0.3

### Patch Changes

- Updated dependencies [[`b3fda50f0`](https://github.com/clerk/javascript/commit/b3fda50f03672106c6858219fc607d226851ec10), [`b3ad7a459`](https://github.com/clerk/javascript/commit/b3ad7a459c46be1f8967faf73c2cdd96406593c8), [`4e5de1164`](https://github.com/clerk/javascript/commit/4e5de1164d956c7dc21f72d25e312296d36504a7)]:
  - @clerk/backend@1.1.0

## 0.0.2

### Patch Changes

- Updated dependencies [[`3c6e5a6f1`](https://github.com/clerk/javascript/commit/3c6e5a6f1dd0ac198e6e48d1b83c6d4846a7f900), [`65503dcb9`](https://github.com/clerk/javascript/commit/65503dcb97acb9538e5c0e3f8199d20ad31c9d7d)]:
  - @clerk/backend@1.0.1

## 0.0.1

### Patch Changes

- 8d73bea16: Introduce [Express](https://expressjs.com/) specific Clerk SDK called `@clerk/express`. The SDK exposes the following APIs:

  - `clerkClient`: Default [`@clerk/backend`](https://clerk.com/docs/references/backend/overview) client initialized from environment variables and used to make backend API requests
  - `clerkMiddleware`: Centralized middleware that authenticates all requests without blocking them (also triggers handshake mechanism)
  - `getAuth`: Utility to retrieve the auth state from a request (requires `clerkMiddleware` to be executed)
  - `requireAuth`: Middleware that returns HTTP 401 response when request is signed-out

  Also all the top level exports from `@clerk/backend` are re-exported from `@clerk/express`.

- 30c11f532: Set the version of `@clerk/express` to 0.0.1 pre-release
- Updated dependencies [3a2f13604]
- Updated dependencies [8c23651b8]
- Updated dependencies [f4f99f18d]
- Updated dependencies [743c4d204]
- Updated dependencies [4b8bedc66]
- Updated dependencies [9272006e7]
- Updated dependencies [c2a090513]
- Updated dependencies [966b31205]
- Updated dependencies [1834a3ee4]
- Updated dependencies [a8901be64]
- Updated dependencies [896cb6104]
- Updated dependencies [64d3763ec]
- Updated dependencies [8350109ab]
- Updated dependencies [7b200af49]
- Updated dependencies [988a299c0]
- Updated dependencies [ecb60da48]
- Updated dependencies [deac67c1c]
- Updated dependencies [b3a3dcdf4]
- Updated dependencies [1dc28ab46]
- Updated dependencies [83e9d0846]
- Updated dependencies [244de5ea3]
- Updated dependencies [791c49807]
- Updated dependencies [935b0886e]
- Updated dependencies [93d05c868]
- Updated dependencies [ea4933655]
- Updated dependencies [a9fe242be]
- Updated dependencies [448e02e93]
- Updated dependencies [2671e7aa5]
- Updated dependencies [799abc281]
- Updated dependencies [4aaf5103d]
- Updated dependencies [a68eb3083]
- Updated dependencies [2de442b24]
- Updated dependencies [15af02a83]
- Updated dependencies [db18787c4]
- Updated dependencies [7f833da9e]
- Updated dependencies [de6519daa]
- Updated dependencies [e6ecbaa2f]
- Updated dependencies [ef2325dcc]
- Updated dependencies [6a769771c]
- Updated dependencies [fc3ffd880]
- Updated dependencies [8b6b094b9]
- Updated dependencies [bab2e7e05]
- Updated dependencies [71663c568]
- Updated dependencies [a6b893d28]
- Updated dependencies [02976d494]
- Updated dependencies [492b8a7b1]
- Updated dependencies [8e5c881c4]
- Updated dependencies [9e99eb727]
- Updated dependencies [034c47ccb]
- Updated dependencies [e5c989a03]
- Updated dependencies [7ecd6f6ab]
- Updated dependencies [12f3c5c55]
- Updated dependencies [c776f86fb]
- Updated dependencies [90aa2ea9c]
- Updated dependencies [1e98187b4]
- Updated dependencies [a605335e1]
- Updated dependencies [2e77cd737]
- Updated dependencies [2964f8a47]
- Updated dependencies [7af0949ae]
- Updated dependencies [97407d8aa]
- Updated dependencies [63dfe8dc9]
- Updated dependencies [e921af259]
- Updated dependencies [d08ec6d8f]
- Updated dependencies [dd5703013]
- Updated dependencies [5f58a2274]
- Updated dependencies [03079579d]
- Updated dependencies [c22cd5214]
- Updated dependencies [52ff8fe6b]
- Updated dependencies [86d52fb5c]
- Updated dependencies [c7e6d00f5]
- Updated dependencies [8cc45d2af]
- Updated dependencies [a9fe242be]
- Updated dependencies [97407d8aa]
- Updated dependencies [12962bc58]
- Updated dependencies [7cb1241a9]
- Updated dependencies [9615e6cda]
- Updated dependencies [0ec3a146c]
- Updated dependencies [4bb57057e]
- Updated dependencies [bad4de1a2]
- Updated dependencies [d4ff346dd]
- Updated dependencies [7644b7472]
- Updated dependencies [2ec9f6b09]
- Updated dependencies [66b283653]
- Updated dependencies [46040a2f3]
- Updated dependencies [cace85374]
- Updated dependencies [1ad910eb9]
- Updated dependencies [8daf8451c]
- Updated dependencies [f58a9949b]
- Updated dependencies [4aaf5103d]
- Updated dependencies [75ea300bc]
- Updated dependencies [d22e6164d]
- Updated dependencies [e1f7eae87]
- Updated dependencies [7f751c4ef]
- Updated dependencies [4fced88ac]
- Updated dependencies [f5d55bb1f]
- Updated dependencies [0d1052ac2]
- Updated dependencies [d30ea1faa]
- Updated dependencies [e7e2a1eae]
- Updated dependencies [1fd2eff38]
- Updated dependencies [5471c7e8d]
- Updated dependencies [a6308c67e]
- Updated dependencies [0ce0edc28]
- Updated dependencies [9b02c1aae]
- Updated dependencies [051833167]
- Updated dependencies [b4e79c1b9]
- Updated dependencies [38d8b3e8a]
- Updated dependencies [be991365e]
- Updated dependencies [8350f73a6]
- Updated dependencies [e0e79b4fe]
- Updated dependencies [e602d6c1f]
- Updated dependencies [142ded732]
- Updated dependencies [fb794ce7b]
- Updated dependencies [e6fc58ae4]
- Updated dependencies [6fffd3b54]
- Updated dependencies [a6451aece]
- Updated dependencies [987994909]
- Updated dependencies [40ac4b645]
- Updated dependencies [1bea9c200]
- Updated dependencies [6f755addd]
- Updated dependencies [6eab66050]
- Updated dependencies [c2b982749]
  - @clerk/backend@1.0.0
  - @clerk/shared@2.0.0

## 1.0.1-beta.4

### Patch Changes

- Updated dependencies [[`bab2e7e05`](https://github.com/clerk/javascript/commit/bab2e7e0590d0da1fd7db0680e63e8f2eb836b41)]:
  - @clerk/shared@2.0.0-beta.23
  - @clerk/backend@1.0.0-beta.37

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
