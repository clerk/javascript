<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_chrome_extension" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/chrome-extension</h1>
</p>

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_chrome_extension)
[![Follow on Twitter](https://img.shields.io/twitter/follow/Clerk?style=social)](https://twitter.com/intent/follow?screen_name=Clerk)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/chrome-extension/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_chrome_extension)

</div>

## Getting Started

[Clerk](https://clerk.com/?utm_source=github&utm_medium=clerk_chrome_extension) is the easiest way to add authentication and user management to your Browser Extension. Add sign up, sign in, and profile management to your application in minutes.

### Prerequisites

- Node.js `>=18.17.0` or later
- An existing Clerk application. [Create your account for free](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=clerk_chrome_extension).
- An existing React app (using [Vite](https://crxjs.dev/vite-plugin/) for example)

### Feature Support

Please see the latest extension [authentication support matrix](https://clerk.com/docs/references/chrome-extension/overview?utm_source=github&utm_medium=clerk_chrome_extension) in the Clerk documentation for more information.

### Usage

1.  **Installation:** `npm install @clerk/chrome-extension`
2.  **Set a consistent extension key**: A browser extension can be identified by its unique key, in a similar way to how a website can be identified by its domain. You will need to explicitly configure your extension's key or it will change often. If the key changes, it can cause the extension to fail. See the [Configure a Consistent Key](https://clerk.com/docs/references/chrome-extension/configure-consistent-crx-id?utm_source=github&utm_medium=clerk_chrome_extension) guide for more information.
3.  **Update Clerk Settings**: Once you've set up a consistent extension key, you'll need to configure your Clerk settings to allow the extension to communicate with your Clerk API.
    You can do this by adding the extension key to the list of allowed origins in your Clerk settings. Setting the `allowed_origins` is **required** for both **Development** and **Production** instances.

    ```bash
    curl  -X PATCH https://api.clerk.com/v1/instance \
          -H "Content-type: application/json" \
          -H "Authorization: Bearer <CLERK_SECRET_KEY>" \
          -d '{"allowed_origins": ["chrome-extension://<YOUR_EXTENSION_KEY>"]}'
    ```

4.  **Set Environment Variables:** Retrieve the **Publishable key** from your [Clerk dashboard](https://dashboard.clerk.com/last-active?path=api-keys&utm_source=github&utm_medium=clerk_chrome_extension) and set it as an environment variable.

    ```sh
    # Vite
    VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
    ```

    ```sh
    # Plasmo
    PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
    ```

5.  **Update the extension manifest:** You'll need to update your extension manifest permissions to support Clerk.
    1. [**Base configuration**:](/packages/chrome-extension/docs/manifest.md#base-configuration) Use this if you plan to only use Clerk in the context of the extension.
    2. [**Session sync configuration**:](/packages/chrome-extension/docs/manifest.md#sync-host-configuration) Use this if you plan to share authentication with a website in the same browser.
6.  **Add Clerk to your app:** Though not required, we generally suggest using Plasmo for browser extension development. This will enforce common standards across your extension as well as allow for easier integration with other browsers in the future.
    1. [**Via `ClerkProvider`:**](/packages/chrome-extension/docs/clerk-provider.md) This is the general approach to all extensions. From here you'll be able to support extension-only authentication as well as sharing authentication with a website in the same browser.
    2. [**Via service workers**:](/packages/chrome-extension/docs/service-workers.md) If you also require the use of background service workers, this will allow you to access the Clerk client from the extension context.

## Example repositories

- [Standalone](https://github.com/clerk/clerk-chrome-extension-starter/tree/main): The extension is using its own authentication
- [WebSSO](https://github.com/clerk/clerk-chrome-extension-starter/tree/webapp_sso): The extensions shares authentication with a website in the same browser

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- On [our support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_chrome_extension)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/chrome-extension` follows good practices of security, but 100% security cannot be assured.

`@clerk/chrome-extension` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/chrome-extension/LICENSE) for more information.
