<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_javascript" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# Official Clerk JavaScript SDKs

This repository contains all the Clerk JavaScript SDKs under the `@clerk/` namespace. Visit [https://clerk.com](https://clerk.com) to signup for an account.

[![chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.com/invite/b5rXHjAg7A)
[![documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://docs.clerk.com)
[![twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

---

**Clerk is Hiring!**

Would you like to work on Open Source software and help maintain this repository? [Apply today!](https://apply.workable.com/clerk-dev/).

---

## Documentation and Usage

For how to get started with Clerk, you can refer to the official [documentation page](https://docs.clerk.com/).

For JavaScript environments/platforms that Clerk supports, there should be a specific package corresponding to the respective technology.

```sh
npm install @clerk/clerk-sdk-node
# or
yarn add @clerk/clerk-sdk-node
```

## Packages

For package specific details on installation, architecture and usage usage, you can refer to the package's README file.

- [`@clerk/backend`](./packages/backend): Functionalities regarded as "core" for Clerk to operate with. _Authentication resolution, API Resources etc._
- [`@clerk/clerk-expo`](./packages/expo) Clerk package for the Expo universal app framework.
- [`@clerk/clerk-js`](./packages/clerk-js): Core JavaScript implementation used by Clerk in the browser.
- [`@clerk/clerk-react`](./packages/react) Clerk package for React applications.
- [`@clerk/clerk-sdk-node`](./packages/sdk-node): SDK for native Node.js environment and frameworks.
- [`@clerk/fastify`](./packages/fastify): Clerk package for Fastify.
- [`@clerk/chrome-extension`](./packages/chrome-extension): Clerk package for Chrome extensions.
- [`@clerk/nextjs`](./packages/nextjs): Clerk package for Next.js.
- [`@clerk/remix`](./packages/remix): Clerk package for Remix.
- [`@clerk/types`](./packages/types) Main TypeScript typings for Clerk libraries.
- ...

Additionally there are packages which act as shared utilities or building blocks.

## Setup

- Clone the repository.
- `npm install`.
- `npm run build`.

\* See the [docs folder](./docs) for additional repository documentation.

## Cleanup

To clean existing builds and installed dependencies of the monorepo and setup again, run `npm run nuke`.

## How to add a new localization key

- Add the key types to the types [package](./packages/types/src/localization.ts).
- Add the corresponding localization values for every supported language in the [localizations package](./packages/localizations/)
- Replace the plain string (if there is one) with the localization value like so:  
  `<Text>Role</Text>`  
  becomes  
  `<Text localizationKey={localizationKeys('formFieldLabel__role')} />`
