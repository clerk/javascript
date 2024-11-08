<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_vue" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/vue</h1>
</p>

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_vue)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/vue/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_vue)

</div>

[Clerk](https://clerk.com/?utm_source=github&utm_medium=clerk_vue) is the easiest way to add authentication and user management to your Vue application. Add sign up, sign in, and profile management to your application in minutes.

### Prerequisites

- Vue 3.2 or later
- Node.js `>=18.17.0` or later
- An existing Clerk application. [Create your account for free](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=clerk_vue).

### Installation

Add `@clerk/vue` as a dependency

```bash
npm install @clerk/vue
```

### Build

To build the package locally with the TypeScript compiler, run:

```bash
npm run build
```

## Usage

Make sure the following environment variables are set in a `.env.local` file in your Vite project:

```
VITE_CLERK_PUBLISHABLE_KEY=[publishable-key]
```

Then, install the Clerk plugin in your main Vue application:

```js
import { createApp } from 'vue';
import App from './App.vue';
import { clerkPlugin } from '@clerk/vue';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const app = createApp(App);
app.use(clerkPlugin, {
  publishableKey: PUBLISHABLE_KEY,
});
app.mount('#app');
```

You can now start using Clerk's components. Here's a basic example showing a header component:

```vue
<script setup>
import { SignedIn, SignedOut, UserButton } from '@clerk/vue';
</script>

<template>
  <header>
    <h1>My App</h1>
    <SignedIn>
      <UserButton />
    </SignedIn>
    <SignedOut>
      <a href="/sign-in">Sign in</a>
    </SignedOut>
  </header>
</template>
```

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- On [our support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_vue)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/vue` follows good practices of security, but 100% security cannot be assured.

`@clerk/vue` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/vue/LICENSE) for more information.
