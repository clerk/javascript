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
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/chrome-extension/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_chrome_extension)

</div>

## Getting Started

[Clerk](https://clerk.com/?utm_source=github&utm_medium=clerk_chrome_extension) is the easiest way to add authentication and user management to your Next.js application. Add sign up, sign in, and profile management to your application in minutes.

### Prerequisites

- Node.js `>=18.17.0` or later
- An existing Clerk application. [Create your account for free](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=clerk_chrome_extension).
- An existing React app (using [Vite](https://crxjs.dev/vite-plugin/) for example)

### Installation

1. Add `@clerk/chrome-extension` to your project:

   ```shell
   npm install @clerk/chrome-extension
   ```

1. Retrieve the **Publishable key** from your [Clerk dashboard](https://dashboard.clerk.com/last-active?path=api-keys) and set it as an environment variable. For example, if you used Vite:

   ```sh
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
   ```

1. Add `<ClerkProvider>` to your app and define the `routerPush` & `routerReplace` properties. For example, with using `react-router-dom`:

   ```tsx
   // App.tsx
   import { SignedIn, SignedOut, SignIn, SignUp, ClerkProvider } from '@clerk/chrome-extension';
   import { useNavigate, Routes, Route, MemoryRouter } from 'react-router-dom';

   function HelloUser() {
     return <p>Hello user</p>;
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

## Usage

Example repositories:

- [Standalone](https://github.com/clerk/clerk-chrome-extension-starter/tree/main): The extension is using its own authentication
- [WebSSO](https://github.com/clerk/clerk-chrome-extension-starter/tree/webapp_sso): The extensions shares authentication with a website in the same browser

### WebSSO

If you want to use **WebSSO** (extension shares authentication state with a website in same browser) you'll need to add the `syncSessionWithTab` prop to `<ClerkProvider>`.

#### Extension Manifest (`manifest.json`)

You must enable the following permissions in your `manifest.json` file:

```json
{
  "permissions": ["cookies", "storage"]
}
```

More info on the "cookies" permission: [Google Developer Cookies Reference](https://developer.chrome.com/docs/extensions/reference/cookies/).
More info on the "storage" permission: [Google Developer Storage Reference](https://developer.chrome.com/docs/extensions/reference/storage/).

#### Host Permissions

You must enable the following host permissions in your `manifest.json` file:

- **Development:** `"host_permissions": ["http://localhost"]`
  - If you're using a domain other than `localhost`, you'll want replace that entry with your domain: `http://<DOMAIN>`
- **Production:** `"host_permissions": ["https://<YOUR_CLERK_FRONTEND_API_GOES_HERE>/"]`
  - Your Frontend API URL can be found in [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys) under the **Show API URLs** option.

For more info on host permissions visit [Google's developer `host_permissions` reference](https://developer.chrome.com/docs/extensions/mv3/declare_permissions/#host-permissions).

#### Clerk Settings

Add your Chrome extension origin to your instance's `allowed_origins` using the [Backend API](https://clerk.com/docs/reference/backend-api):

```bash
curl  -X PATCH https://api.clerk.com/v1/instance \
      -H "Authorization: Bearer sk_secret_key" \
      -H "Content-type: application/json" \
      -d '{"allowed_origins": ["chrome-extension://extension_id_goes_here"]}'
```

Setting the `allowed_origins` is **required** for both **Development** and **Production** instances.

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
