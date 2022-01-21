<p align="center">
  <a href="https://clerk.dev/" target="_blank" align="center">
    <img src="./docs/clerk-logo.svg" height="50">
  </a>
  <br />
</p>

# Official Clerk JavaScript SDKs

This repository contains all the Clerk JavaScript SDKs under the `@clerk/` namespace. Visit [https://clerk.dev](https://clerk.dev) to signup for an account.

---

**Clerk is Hiring!**

Would you like to work on Open Source software and help maintain this repository? Apply today https://apply.workable.com/clerk-dev/.

---

## Documentation and Usage

For how to get started with Clerk, you can refer to the official [documentation page](https://docs.clerk.dev/).

For JavaScript environments/platforms that Clerk supports, there should be a specific package corresponding to the respective technology.

```sh
npm install @clerk/clerk-sdk-node
# or
yarn add @clerk/clerk-sdk-node
```

## Packages

For package specific details on installation, architecture and usage usage, you can refer to the package's README file.

- [`@clerk/backend-core`](https://github.com/clerkinc/javascript/tree/main/packages/backend-core): Functionalities regarded as "core" for Clerk to operate with. _Authentication resolution, API Resources etc._
- [`@clerk/edge`](https://github.com/clerkinc/javascript/tree/main/packages/edge): Top level SDK for edge environments containing all required helpers and middleware.
- [`@clerk/clerk-sdk-node`](https://github.com/clerkinc/javascript/tree/main/packages/sdk-node): SDK for native Node.js environment and frameworks.
- `@clerk/nextjs` _Coming soon_
- `@clerk/types` _Coming soon_
- `@clerk/react` _Coming soon_
- ...


Additionally there are packages which act as shared utilities or building blocks.

## Setup
- Clone the repository.
- `npm install`.
- `npm run build`.

\* See the [docs folder](./docs) for additional repository documentation.