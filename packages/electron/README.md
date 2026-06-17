<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_electron" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/electron</h1>
</p>

<div align="center">

[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_electron)
[![Follow on X](https://img.shields.io/twitter/follow/clerk?style=social)](https://x.com/intent/follow?screen_name=clerk)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/electron/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_electron)

</div>

## Getting Started

[Clerk](https://clerk.com/?utm_source=github&utm_medium=clerk_electron) is the easiest way to add authentication and user management to your Electron application.

> [!WARNING]
> `@clerk/electron` is under active development and is not yet ready for production use. The API is incomplete and subject to change.

This package exposes entrypoints for Electron's distinct runtime contexts:

- `@clerk/electron` — for use in the Electron **main** process.
- `@clerk/electron/preload` — for use in Electron **preload** scripts.
- `@clerk/electron/react` — for use in the Electron **renderer** process.
- `@clerk/electron/storage` — default token storage backed by `electron-store`.

```ts
// main.ts
import { app, BrowserWindow, net, protocol } from 'electron';
import { createClerkBridge } from '@clerk/electron';
import { storage } from '@clerk/electron/storage';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

createClerkBridge({
  storage: storage(),
  renderer: {
    scheme: 'my-app',
    host: 'renderer',
  },
});

app.whenReady().then(() => {
  protocol.handle('my-app', request => {
    const url = new URL(request.url);
    const file = url.pathname === '/' ? 'index.html' : url.pathname;

    return net.fetch(pathToFileURL(join(__dirname, '../renderer', file)).toString());
  });

  const win = new BrowserWindow({
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
    },
  });

  win.loadURL('my-app://renderer/');
});
```

In `my-app://renderer/sign-in`, `my-app` is the scheme, `renderer` is the host, `my-app://renderer` is the origin, and `/sign-in` is the path. If your renderer uses path-based routing, serve every route from the same origin and fall back to your renderer entrypoint as needed.

```ts
// preload.ts
import { exposeClerkBridge } from '@clerk/electron/preload';

exposeClerkBridge();
```

```tsx
// renderer.tsx
import { ClerkProvider } from '@clerk/electron/react';

<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>{/* ... */}</ClerkProvider>;
```

## Content Security Policy

`@clerk/electron` loads Clerk's prebuilt UI from Clerk's CDN at runtime rather than bundling it, so your renderer's Content Security Policy must allow Clerk's Frontend API host. If it doesn't, the UI script fails to load and Clerk components never render.

Replace `{fapi_host}` below with your instance's **Frontend API** host, found in the [Clerk Dashboard](https://dashboard.clerk.com) under **API keys**. It includes a `clerk.` segment (for example, `clerk.your-app.com` in production or `your-slug.clerk.accounts.dev` in development). This is _not_ the Account Portal URL (`your-slug.accounts.dev`) — using that host blocks the UI script from loading.

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://{fapi_host} https://challenges.cloudflare.com;
connect-src 'self' https://{fapi_host};
img-src 'self' https://img.clerk.com data:;
style-src 'self' 'unsafe-inline';
worker-src 'self' blob:;
frame-src 'self' https://challenges.cloudflare.com;
form-action 'self';
```

> [!NOTE]
> This covers sign-in/up and the hotloaded UI. If you use Clerk Billing (Stripe) or other features, you'll need to allow additional origins; see Clerk's [CSP guide](https://clerk.com/docs/guides/secure/best-practices/csp-headers) for the full list.

Apply it either with a `<meta>` tag in your renderer HTML:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline' https://{fapi_host} https://challenges.cloudflare.com; connect-src 'self' https://{fapi_host}; img-src 'self' https://img.clerk.com data:; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:; frame-src 'self' https://challenges.cloudflare.com; form-action 'self';"
/>
```

or, as [Electron's security guide](https://www.electronjs.org/docs/latest/tutorial/security#7-define-a-content-security-policy) recommends, as a response header from the main process:

```ts
// main.ts
import { app, session } from 'electron';

const fapiHost = 'clerk.your-app.com';

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          [
            "default-src 'self'",
            `script-src 'self' 'unsafe-inline' https://${fapiHost} https://challenges.cloudflare.com`,
            `connect-src 'self' https://${fapiHost}`,
            "img-src 'self' https://img.clerk.com data:",
            "style-src 'self' 'unsafe-inline'",
            "worker-src 'self' blob:",
            "frame-src 'self' https://challenges.cloudflare.com",
            "form-action 'self'",
          ].join('; '),
        ],
      },
    });
  });
});
```

> [!NOTE]
> Loading the renderer from a dev server (such as Vite) requires looser rules for HMR: add `'unsafe-eval'` to `script-src` and your dev server's origin to `connect-src` (for example, `ws://localhost:<port> http://localhost:<port>`). Many apps skip CSP during development and apply it only to packaged builds.

## Support

For help, visit our [support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_electron).

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/electron` follows good practices of security, but 100% security cannot be assured.

`@clerk/electron` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/electron/LICENSE) for more information.
