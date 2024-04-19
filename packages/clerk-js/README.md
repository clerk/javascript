<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_js" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/clerk-js

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_js)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/clerk-js/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Ask a Question](https://github.com/clerk/javascript/discussions)

</div>

---

## Overview

ClerkJS is our foundational JavaScript library for building user management and authentication. It enables you to register, sign in, verify and manage users for your application using highly customizable flows.

## Getting Started

### Installation

There are two ways you can include ClerkJS in your project. You can either [import the ClerkJS npm module](#install-clerkjs-as-es-module) or [load ClerkJS with a script tag](#install-clerkjs-as-script).

### Install ClerkJS as ES module

```sh
npm install @clerk/clerk-js
```

Once you have installed the package, you will need to import the ClerkJS object constructor into your code and pass it your [Publishable Key](https://dashboard.clerk.com/last-active?path=api-keys) as a parameter.

```js
import Clerk from '@clerk/clerk-js';

const clerkPublishableKey = 'pk_[publishable_key]';
const clerk = new Clerk(clerkPublishableKey);
await clerk.load({
  // Set load options here...
});
```

### Install ClerkJS as script

ClerkJS can be loaded from a `<script />` tag with the source from your [Frontend API URL](https://dashboard.clerk.com/last-active?path=api-keys).

Add the following script to your site's `<body>` element:

```html
<script>
  // Get this URL and Publishable Key from the Clerk Dashboard
  const clerkPublishableKey = 'pk_[publishable_key]';
  const frontendApiUrl = '[your-domain].clerk.accounts.dev';
  const version = '@latest'; // Set to appropriate version

  // Creates asynchronous script
  const script = document.createElement('script');
  script.setAttribute('data-clerk-publishable-key', clerkPublishableKey);
  script.async = true;
  script.src = `https://${frontendApiUrl}/npm/@clerk/clerk-js${version}/dist/clerk.browser.js`;

  // Adds listener to initialize ClerkJS after it's loaded
  script.addEventListener('load', async function () {
    await window.Clerk.load({
      // Set load options here...
    });
  });
  document.body.appendChild(script);
</script>
```

### Build

To build the package locally with Webpack, run:

```sh
npm run build
```

## Usage

```html
<h1>Hello Clerk!</h1>

<button
  id="sign-in-button"
  onclick="Clerk.openSignIn()"
>
  Sign In
</button>
<div id="user-button"></div>

<script>
  async function loadClerk() {
    const userButton = document.getElementById('user-button');
    const signInButton = document.getElementById('sign-in-button');

    await window.Clerk.load();

    if (Clerk.user) {
      Clerk.mountUserButton(userButton);
      signInButton.hidden = true;
    }
  }
  // [...] Installation code
</script>
```

_For further details and examples, please refer to our [Documentation](https://clerk.com/docs?utm_source=github&utm_medium=clerk_js)._

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Create a [GitHub Discussion](https://github.com/clerk/javascript/discussions)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_js)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md).

## Security

`@clerk/clerk-js` follows good practices of security, but 100% security cannot be assured.

`@clerk/clerk-js` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/clerk-js/LICENSE) for more information.
