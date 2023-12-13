<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_chrome_extension" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/chrome-extension

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_chrome_extension)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/chrome-extension/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://github.com/clerk/javascript/issues/new?assignees=&labels=feature-request&projects=&template=FEATURE_REQUEST.yml)
·
[Ask a Question](https://github.com/clerk/javascript/discussions)

</div>

---

## Overview

[Clerk](https://clerk.com?utm_source=github&utm_medium=clerk_chrome_extension) is the easiest way to add authentication and user management to your chrome extension. To gain a better understanding of the Clerk React SDK and [Frontend API](https://reference.clerk.com/reference/frontend-api-reference), refer to
the <a href="https://clerk.com/docs/reference/node/getting-started?utm_source=github&utm_medium=clerk_chrome_extension" target="_blank">Node SDK</a> and <a href="https://clerk.com/docs/reference/backend-api" target="_blank">Backend API</a> documentation.

## Getting Started

To use this package you should first create a Clerk application and retrieve a `Publishable Key` for you application to be used as environment variables `VITE_CLERK_PUBLISHABLE_KEY`.

### Prerequisites

- Node.js `>=18.17.0` or later

### Installation

```shell
npm install @clerk/chrome-extension
```

## Usage

Standalone usage snippet:

```tsx
// App.tsx
import { SignedIn, SignedOut, SignIn, SignUp, ClerkProvider } from '@clerk/chrome-extension';
import { useNavigate, Routes, Route, MemoryRouter } from 'react-router-dom';

function HelloUser() {
  return <p> Hello user</p>;
}

const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || '';

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      routerPush={to => navigate(to)}
      routerReplace={to => navigate(to, { replace: true })}
    >
      <Routes>
        <Route
          path='/sign-up/*'
          element={<SignUp signInUrl='/' />}
        />
        <Route
          path='/'
          element={
            <>
              <SignedIn>
                <HelloUser />
              </SignedIn>
              <SignedOut>
                <SignIn
                  afterSignInUrl='/'
                  signUpUrl='/sign-up'
                />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </ClerkProvider>
  );
}

function App() {
  return (
    <MemoryRouter>
      <ClerkProviderWithRoutes />
    </MemoryRouter>
  );
}

export default App;
```

WebSSO usage snippet:

```tsx
// App.tsx
// use same code with the above & add the syncSessionWithTab prop in <ClerkProvider/>

// ...
<ClerkProvider
  publishableKey={publishableKey}
  routerPush={to => navigate(to)}
  routerReplace={to => navigate(to, { replace: true })}
  syncSessionWithTab
>
  {/* ... */}
</ClerkProvider>
// ...
```

Examples of a chrome extension using the `@clerk/chrome-extension` package for authentication
can be found in our `clerk-chrome-extension-starter` github repository.
The 2 supported cases (links to different branches of the same repository):

- [Standalone](https://github.com/clerk/clerk-chrome-extension-starter/tree/main): The extension is using its own authentication
- [WebSSO](https://github.com/clerk/clerk-chrome-extension-starter/tree/webapp_sso): The extensions shares authentication with a website in the same browser

## WebSSO required settings

### Extension Manifest (`manifest.json`)

#### Permissions

You must enable the following permissions in your `manifest.json` file:

```
"permissions": ["cookies", "storage"]
```

- For more info on the "cookies" permission: (Google Developer Cookies Reference)[https://developer.chrome.com/docs/extensions/reference/cookies/]
- For more info on the "storage" permission: (Google Developer Storage Reference)[https://developer.chrome.com/docs/extensions/reference/storage/]

#### Host Permissions

You must enable the following host permissions in your `manifest.json` file:

- **Development:** `"host_permissions": ["http://localhost"]`
  - If you're using a domain other than `localhost`, you'll want replace that entry with your domain: `http://<DOMAIN>`
- **Production:** `"host_permissions": ["https://<YOUR_CLERK_FRONTEND_API_GOES_HERE>/"]`
  - Your Frontend API URL can be found in `Clerk Dashboard > API Keys > Advanced > Clerk API URLs`.

For more info on host permissions: (Google Developer `host_permissions` Reference)[https://developer.chrome.com/docs/extensions/mv3/declare_permissions/#host-permissions]

<a name="clerk-settings"></a>

### Clerk Settings

Add your Chrome extension origin to your instance allowed_origins using BAPI:

```bash
curl  -X PATCH https://api.clerk.com/v1/instance \
      -H "Authorization: Bearer sk_secret_key" \
      -H "Content-type: application/json" \
      -d '{"allowed_origins": ["chrome-extension://extension_id_goes_here"]}'
```

## Deploy to Production

Setting the `allowed_origins` (check [Clerk Settings](#clerk-settings)) is **REQUIRED** for both **Development** and **Production** instances when using the WebSSO use case.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Create a [GitHub Discussion](https://github.com/clerk/javascript/discussions)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_chrome_extension)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md).

## Security

`@clerk/chrome-extension` follows good practices of security, but 100% security cannot be assured.

`@clerk/chrome-extension` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/chrome-extension/LICENSE) for more information.
