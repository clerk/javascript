<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_chrome_extension" target="_blank" rel="noopener noreferrer">
    <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
  </a>
  <br /> 
</p>

# @clerk/chrome-extension

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_chrome_extension)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerkinc/javascript/blob/main/packages/chrome-extension/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=bug&template=bug_report.md&title=Bug%3A+)
·
[Request a Feature](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=Feature%3A+)
·
[Ask a Question](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)

</div>

---

## Overview

[Clerk](https://clerk.com?utm_source=github&utm_medium=clerk_chrome_extension) is the easiest way to add authentication and user management to your chrome extension. To gain a better understanding of the Clerk React SDK and [Frontend API](https://reference.clerk.com/reference/frontend-api-reference), refer to
the <a href="https://clerk.com/docs/reference/node/getting-started?utm_source=github&utm_medium=clerk_chrome_extension" target="_blank">Node SDK</a> and <a href="https://clerk.com/docs/reference/backend-api" target="_blank">Backend API</a> documentation.

## Getting Started

To use this package you should first create a Clerk application and retrieve a `Publishable Key` for you application to be used as environment variables `REACT_APP_CLERK_PUBLISHABLE_KEY`.

### Prerequisites

- Node.js v14+

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

const publishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || '';

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      navigate={to => navigate(to)}
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
  navigate={to => navigate(to)}
  syncSessionWithTab
>
  {/* ... */}
</ClerkProvider>
//...
```

Examples of a chrome extension using the `@clerk/chrome-extension` package for authentication
can be found in our `clerk-chrome-extension-starter` github repository.
The 2 supported cases (links to different branches of the same repository):

- [Standalone](https://github.com/clerkinc/clerk-chrome-extension-starter/tree/main): The extension is using its own authentication
- [WebSSO](https://github.com/clerkinc/clerk-chrome-extension-starter/tree/webapp_sso): The extensions shares authentication with a website in the same browser

## WebSSO required settings

### Permissions (in manifest.json)

- "cookies" for more info see (here)[https://developer.chrome.com/docs/extensions/reference/cookies/]
- "storage" for more info see (here)[https://developer.chrome.com/docs/extensions/reference/storage/]

### Host permissions (in manifest.json)

You will need your Frontend API URL, which can be found in your `Dashboard > API Keys > Advanced > Clerk API URLs`.

```
"host_permissions": ["*://YOUR_CLERK_FRONTEND_API_GOES_HERE/"],
```

<a name="clerk-settings"></a>

### Clerk settings

Add your Chrome extension origin to your instance allowed_origins using BAPI:

```bash
curl  -X PATCH https://api.clerk.com/v1/instance \
      -H "Authorization: Bearer sk_secret_key" \
      -H "Content-type: application/json" \
      -d '{"allowed_origins": ["chrome-extension://extension_id_goes_here"]}'
```

## Development

The `Enable URL-based session syncing` should be `DISABLED` from the `Clerk Dashboard > Setting` for a development instance to support @clerk/chrome-extension functionality.

## Deploy to Production

Setting the `allowed_origins` (check [Clerk Settings](#clerk-settings)) is **REQUIRED** for both **Development** and **Production** instances when using the WebSSO use case.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Open a [GitHub support issue](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_chrome_extension)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerkinc/javascript/blob/main/docs/CONTRIBUTING.md).

## Security

`@clerk/chrome-extension` follows good practices of security, but 100% security cannot be assured.

`@clerk/chrome-extension` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerkinc/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerkinc/javascript/blob/main/packages/chrome-extension/LICENSE) for more information.
