<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=gatsby_plugin_clerk" target="_blank" rel="noopener noreferrer">
    <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
  </a>
  <br />
</p>

# gatsby-plugin-clerk

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.com/invite/b5rXHjAg7A)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=gatsby_plugin_clerk)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerkinc/javascript/blob/main/packages/gatsby-plugin-clerk/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=bug&template=bug_report.md&title=Bug%3A+)
·
[Request a Feature](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=Feature%3A+)
·
[Ask a Question](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)

</div>

---

## Overview

Clerk is the easiest way to add authentication and user management to your Gatsby application. Add sign up, sign in, and profile management to your application in minutes.

## Getting Started

### Prerequisites

- Gatsby v5+
- Node.js v18+

### Installation

```sh
npm install gatsby-plugin-clerk
```

## Usage

Make sure the following environment variables are set in a `.env` file:

```sh
GATSBY_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
```

You can get these from the [API Keys](https://dashboard.clerk.com/last-active?path=api-keys) screen in your Clerk dashboard.

To initialize Clerk with your Gatsby application, simply register the plugin in your `gatsby-config.ts`/`gatsby-config.js` file.
Also, use `dotenv` to access environment variables.

```ts
// gatsby-config.ts
import type { GatsbyConfig } from 'gatsby';

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
});

const config: GatsbyConfig = {
  // ...the rest of your config object
  plugins: ['gatsby-plugin-clerk'],
};

export default config;
```

### Client-side

After those changes are made, you can use Clerk components in your pages.

For example, in `src/pages/index.tsx`:

```jsx
import { SignedIn, SignedOut, SignInButton, UserButton } from 'gatsby-plugin-clerk';

const IndexPage = () => {
  return (
    <div>
      <h1>Hello Clerk!</h1>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton mode='modal' />
      </SignedOut>
    </div>
  );
};

export default IndexPage;
```

### Server-Side Rendering (SSR)

Using `withServerAuth` from `'gatsby-plugin-clerk/ssr'`. Example file `/pages/ssr.tsx`:

```tsx
import * as React from 'react';
import { GetServerData } from 'gatsby';
import { withServerAuth } from 'gatsby-plugin-clerk/ssr';

export const getServerData: GetServerData<any> = withServerAuth(
  async props => {
    return { props: { data: '1', auth: props.auth } };
  },
  { loadUser: true },
);

function SSRPage({ serverData }: any) {
  return (
    <main>
      <h1>SSR Page with Clerk</h1>
      <pre>{JSON.stringify(serverData, null, 2)}</pre>
    </main>
  );
}

export default SSRPage;
```

### Server API routes

Importing `'gatsby-plugin-clerk/api'` gives access to all the exports coming from `@clerk/sdk-node`. Example file `/api/hello.ts`:

```ts
import { clerkClient, withAuth } from 'gatsby-plugin-clerk/api';

const handler = withAuth(async (req, res) => {
  const users = await clerkClient.users.getUserList();
  res.send({ title: `We have ${users.length} users`, auth: req.auth });
});

export default handler;
```

_For further details and examples, please refer to our [Documentation](https://clerk.com/docs/get-started/gatsby?utm_source=github&utm_medium=gatsby_plugin_clerk)._

### Build

To build the package locally with the TypeScript compiler, run:

```sh
npm run build
```

To build the package in watch mode, run the following:

```sh
npm run dev
```

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Open a [GitHub support issue](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=gatsby_plugin_clerk)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerkinc/javascript/blob/main/docs/CONTRIBUTING.md).

## Security

`gatsby-plugin-clerk` follows good practices of security, but 100% security cannot be assured.

`gatsby-plugin-clerk` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerkinc/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerkinc/javascript/blob/main/packages/gatsby-plugin-clerk/LICENSE) for more information.
