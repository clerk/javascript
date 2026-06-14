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
