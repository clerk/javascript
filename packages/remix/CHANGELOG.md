# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.1.0-alpha.3](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.1.0-alpha.2...@clerk/remix@0.1.0-alpha.3) (2022-02-25)


### Bug Fixes

* **remix:** Make `rootAuthLoader` only throw if a callback exists ([cec342f](https://github.com/clerkinc/javascript/commit/cec342f36d09d7f829589e145e7f4be60aea5d13))



## 0.1.0-alpha.2 (2022-02-25)


### Features

* **clerk-remix:** Introduce basic clerk-remix structure ([f4f8e06](https://github.com/clerkinc/javascript/commit/f4f8e06385acb8fb5f142808309a95586660d76e))
* **clerk-remix:** Introduce ClerkProvider for Remix ([d63e4bf](https://github.com/clerkinc/javascript/commit/d63e4bff960729977997d7cc0011ad90ea794225))
* **clerk-remix:** Introduce global polyfill ([c3df5af](https://github.com/clerkinc/javascript/commit/c3df5afe5998a4872d7a617a18161c98e6753483))
* **clerk-remix:** Introduce SSR getAuth for Remix ([8ee0eaf](https://github.com/clerkinc/javascript/commit/8ee0eafc8409d1a947daab3c677331fbded24dba))
* **clerk-remix:** Introduce SSR rootAuthLoader for Remix ([693f79b](https://github.com/clerkinc/javascript/commit/693f79beda21108f1f1a67dd612c1eca6506d788))
* **clerk-remix:** Remove load options from `getAuth` ([5c1e23d](https://github.com/clerkinc/javascript/commit/5c1e23db40b7a49b7cec5a1d8206daad160e6361))
* **clerk-remix:** Rename InferLoaderData to InferRootLoaderData ([d753291](https://github.com/clerkinc/javascript/commit/d753291f5f61222dc189fded7341cfcce04de20c))
* **remix:** Depend on @remix-run/runtime only ([c5d4c45](https://github.com/clerkinc/javascript/commit/c5d4c4535f8ff7f2a89ec0cf5e1e941ed40b2238))
* **remix:** Introduce `ConnectClerk` HOC ([ea99273](https://github.com/clerkinc/javascript/commit/ea9927366d9591b2aa4a86b94eb2b1e05b505f6c))
* **remix:** Make `rootAuthLoader` require a Response or object return value ([2aab7db](https://github.com/clerkinc/javascript/commit/2aab7dbcf97facfddc42e1694c859fbae76b95db))
* **remix:** Move Remix dependencies to `peerDependencies` ([1ce0ce3](https://github.com/clerkinc/javascript/commit/1ce0ce38f13bf8b0c4255f97507b42cf8e793fde))


### Bug Fixes

* **remix:** Allow no return from `rootAuthLoader` callback ([5e708fd](https://github.com/clerkinc/javascript/commit/5e708fd798181fd0c3f917cc9f431d97d682b3c6))
* **remix:** Make `clerkState` required ([22d2aff](https://github.com/clerkinc/javascript/commit/22d2affd2801f9623257b905aa0687e7ef43ff59))



## [0.1.0-alpha.1](https://github.com/clerkinc/javascript/compare/@clerk/remix@0.1.0-alpha.0...@clerk/remix@0.1.0-alpha.1) (2022-02-18)


### Bug Fixes

* **remix:** Allow no return from `rootAuthLoader` callback ([55f14e0](https://github.com/clerkinc/javascript/commit/55f14e0706eb45b8e6808e7f33d7b430cf3d2afd))
* **remix:** Make `clerkState` required ([df88977](https://github.com/clerkinc/javascript/commit/df88977531b12d15f245ff2cbc8ce360e4d52b91))



## 0.1.0-alpha.0 (2022-02-18)


### Features

* **clerk-remix:** Introduce basic clerk-remix structure ([ef91121](https://github.com/clerkinc/javascript/commit/ef9112144b47714a5a380bcccab9961f91ec17c9))
* **clerk-remix:** Introduce ClerkProvider for Remix ([07abb99](https://github.com/clerkinc/javascript/commit/07abb99111a884e2e22f55a5101292595c066507))
* **clerk-remix:** Introduce global polyfill ([78435ca](https://github.com/clerkinc/javascript/commit/78435ca008a32aa1c2546bc333a5e28e3d5079df))
* **clerk-remix:** Introduce SSR getAuth for Remix ([e9ca753](https://github.com/clerkinc/javascript/commit/e9ca7534e2df55e5d1928d4a1f3a53eca3397252))
* **clerk-remix:** Introduce SSR rootAuthLoader for Remix ([c7a61aa](https://github.com/clerkinc/javascript/commit/c7a61aab89dad2a1c0cde0d658ce4a50f0eb3cd4))
* **clerk-remix:** Remove load options from `getAuth` ([5f4cedc](https://github.com/clerkinc/javascript/commit/5f4cedc70db8398eb196ca769db41ebadb15ab12))
* **clerk-remix:** Rename InferLoaderData to InferRootLoaderData ([aa0c720](https://github.com/clerkinc/javascript/commit/aa0c7208bf8490f24b5b10527c4bb88cf07b79fc))
* **remix:** Depend on @remix-run/runtime only ([7c014f4](https://github.com/clerkinc/javascript/commit/7c014f4327ce46cc7e74a0f637dd7b100baa672b))
