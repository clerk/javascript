<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_nuxt" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/nuxt</h1>
</p>

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_nuxt)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/nuxt/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_nuxt)

</div>

[Clerk](https://clerk.com/?utm_source=github&utm_medium=clerk_nuxt) is the easiest way to add authentication and user management to your Vue application. Add sign up, sign in, and profile management to your application in minutes.

### Prerequisites

- Nuxt 3 or later
- Node.js `>=18.17.0` or later
- An existing Clerk application. [Create your account for free](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=clerk_nuxt).

### Installation

Add `@clerk/nuxt` as a dependency

```bash
npm install @clerk/nuxt
```

### Build

To build the package locally with the TypeScript compiler, run:

```bash
npm run build
```

## Usage

Make sure the following environment variables are set in a `.env` file in your Nuxt project:

```
NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[publishable-key]
CLERK_SECRET_KEY=[secret-key]
```

Then, add `@clerk/nuxt` to the `modules` section of `nuxt.config.ts`:

```js
export default defineNuxtConfig({
  modules: ['@clerk/nuxt'],
});
```

You can now start using Clerk's components. Here's a basic example showing a header component:

```vue
<template>
  <header>
    <h1>My App</h1>
    <SignedIn>
      <UserButton />
    </SignedIn>
    <SignedOut>
      <SignInButton mode="modal" />
    </SignedOut>
  </header>
</template>
```

To protect an API route, you can access the `event.context.auth` object and check the value of `userId` to determine if the user is authenticated:

```ts
export default eventHandler(async event => {
  const { userId } = event.context.auth;

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  return { userId };
});
```

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- On [our support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_nuxt)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/nuxt` follows good practices of security, but 100% security cannot be assured.

`@clerk/nuxt` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/vue/LICENSE) for more information.
