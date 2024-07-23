<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_astro" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/astro

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_astro)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/astro/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Ask a Question](https://github.com/clerk/javascript/discussions)

</div>

---

## Overview

Clerk is the easiest way to add authentication and user management to your Astro application. Add sign up, sign in, and profile management to your Astro application in minutes.

## Getting Started

### Prerequisites

- Astro 3.2 or later
- Node.js `>=18.17.0` or later

### Installation

Add `@clerk/astro` as a dependency

**With npm**

```sh
npm install @clerk/astro
```

**With yarn**

```sh
yarn add @clerk/astro
```

**With pnpm**

```sh
pnpm add @clerk/astro
```

### Build

To build the package locally with the TypeScript compiler, run:

```sh
npm run build
```

To build the package in watch mode, run the following:

```sh
npm run dev
```

## Usage

### Set environment variables

```sh
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_(test|live)_xxxxxxx
CLERK_SECRET_KEY=sk_(test|live)_xxxxxxx

PUBLIC_CLERK_SIGN_IN_URL=/sign-in # update this if sign in page exists on another path
PUBLIC_CLERK_SIGN_UP_URL=/sign-up # update this if sign up page exists on another path
```

### Update `env.d.ts`

```ts
/// <reference types="astro/client" />
/// <reference types="@clerk/astro/env" />
```

### Add integrations

Follow [the instructions](https://clerk.com/docs/quickstarts/astro) in our documentation.

Example configuration file

```js
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import clerk from '@clerk/astro';

export default defineConfig({
  integrations: [clerk()],
  adapter: node({ mode: 'standalone' }),
  output: 'server',
});
```

### Add a middleware file

This step is required in order to use SSR or any control component. Create a `middleware.ts` file inside the `src/` directory.

```ts
import { clerkMiddleware } from '@clerk/astro/server';

export const onRequest = clerkMiddleware();
```

### Use components inside .astro files

```astro
---
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/astro/components";
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="generator" content={Astro.generator} />
  </head>
  <body>
    <header>
      <h1>{title}</h1>
      <nav>
        <SignedOut>
         <SignInButton mode="modal" />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>
    </header>
    <article>
      <slot />
    </article>
  </body>
</html>
```

_For further details and examples, please refer to
our [Documentation](https://clerk.com/docs?utm_source=github&utm_medium=clerk_nextjs)._

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Create a [GitHub Discussion](https://github.com/clerk/javascript/discussions)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_astro)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please
read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md))
.

## Security

`@clerk/astro` follows good practices of security, but 100% security cannot be assured.

`@clerk/astro` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to
our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/astro/LICENSE) for more information.
