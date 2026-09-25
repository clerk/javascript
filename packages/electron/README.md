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
> `@clerk/electron` is in beta. APIs may change before 1.0.

The package has one entrypoint per Electron process:

- `@clerk/electron` runs in the main process.
- `@clerk/electron/preload` runs in preload scripts.
- `@clerk/electron/react` runs in the renderer process.
- `@clerk/electron/storage` is the default token storage, backed by `electron-store`.
- `@clerk/electron/passkeys` adds passkey (WebAuthn) support to the renderer process.

```ts
// main.ts
import { app, BrowserWindow, net, protocol } from 'electron';
import { createClerkBridge } from '@clerk/electron';
import { storage } from '@clerk/electron/storage';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const clerk = createClerkBridge({
  storage: storage(),
  renderer: {
    scheme: 'my-app',
    host: 'renderer',
  },
  passkeys: true,
});

if (clerk.isPrimaryInstance) {
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
}
```

On Windows and Linux, a deep link starts a second copy of the app, so the callback only reaches the
running process through Electron's single-instance lock. When you configure a renderer scheme,
`createClerkBridge` acquires that lock by default and quits secondary processes after it forwards
their command-line arguments. Call it before `app.whenReady()`, and stop your own bootstrap when
`isPrimaryInstance` is `false`. `app.quit()` is asynchronous, so `whenReady` can still fire in a
process that is shutting down. `cleanup()` releases the lock unless the application already owned
it. macOS doesn't need the lock. Deep links arrive through `open-url`, so Clerk takes no lock and
`isPrimaryInstance` is always `true`.

If the application manages the lock, acquire it before creating the bridge and disable Clerk's lock
management:

```ts
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  createClerkBridge({
    storage: storage(),
    renderer: { scheme: 'my-app', host: 'renderer' },
    manageSingleInstanceLock: false,
  });
}
```

Linux packages must also register the renderer scheme in their `.desktop` entry so the browser can
launch the app:

```ini
Exec=/path/to/my-app %U
MimeType=x-scheme-handler/my-app;
```

In `my-app://renderer/sign-in`, `my-app` is the scheme, `renderer` is the host, `my-app://renderer` is the origin, and `/sign-in` is the path. If your renderer uses path-based routing, serve every route from the same origin and fall back to your renderer entrypoint as needed.

```ts
// preload.ts
import { exposeClerkBridge } from '@clerk/electron/preload';

exposeClerkBridge({ passkeys: true });
```

```tsx
// renderer.tsx
import { ClerkProvider } from '@clerk/electron/react';
import { passkeys } from '@clerk/electron/passkeys';

<ClerkProvider
  publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
  passkeys={passkeys}
>
  {/* ... */}
</ClerkProvider>;
```

To set an app-specific product token such as `Acme Co/1.0.0`, pass `userAgent` to `createClerkBridge` before creating renderer windows. Clerk keeps Electron's platform details, such as `Macintosh` or `Windows`. UserProfile's session activity then shows your product token as the app name:

```ts
createClerkBridge({
  storage: storage(),
  renderer: { scheme: 'my-app', host: 'renderer' },
  userAgent: 'Acme Co/1.0.0',
});
```

## Allowed origins

`@clerk/electron` authenticates renderer requests with a bearer token, and Chromium adds an `Origin` header to each of them. Clerk's Frontend API rejects requests that carry both headers unless the origin is in your instance's allowed origins. Until you add it, every request fails with "Setting both the 'Origin' and 'Authorization' headers is forbidden".

Add every origin your renderer loads from. That includes the custom scheme origin of packaged builds (for example, `my-app://renderer`) and your dev server's origin during development (for example, `http://localhost:5173`). Set them with the Backend SDK on each instance you use:

```ts
import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

await clerkClient.instance.update({
  allowedOrigins: ['my-app://renderer', 'http://localhost:5173'],
});
```

Pass the full list of origins each time you call it.

## Content Security Policy

`@clerk/electron` loads Clerk's prebuilt UI from Clerk's CDN at runtime instead of bundling it, so your renderer's Content Security Policy must allow Clerk's Frontend API host. If it doesn't, the UI script fails to load and Clerk components never render.

Replace `{fapi_host}` below with your instance's **Frontend API** host, found in the [Clerk Dashboard](https://dashboard.clerk.com) under **API keys**. It includes a `clerk.` segment (for example, `clerk.your-app.com` in production or `your-slug.clerk.accounts.dev` in development). Don't use the Account Portal URL (`your-slug.accounts.dev`). That host blocks the UI script from loading.

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://{fapi_host} https://challenges.cloudflare.com https://*.protect.clerk.com;
connect-src 'self' https://{fapi_host} https://*.protect.clerk.com https://clerk-telemetry.com;
img-src 'self' https://img.clerk.com data:;
style-src 'self' 'unsafe-inline';
worker-src 'self' blob:;
frame-src 'self' https://challenges.cloudflare.com https://*.protect.clerk.com;
form-action 'self';
```

> [!NOTE]
> This policy covers sign-in, sign-up, and the hotloaded UI. Clerk Billing (Stripe) and other features need more origins. See Clerk's [CSP guide](https://clerk.com/docs/guides/secure/best-practices/csp-headers) for the full list.

Apply it either with a `<meta>` tag in your renderer HTML:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline' https://{fapi_host} https://challenges.cloudflare.com https://*.protect.clerk.com; connect-src 'self' https://{fapi_host} https://*.protect.clerk.com https://clerk-telemetry.com; img-src 'self' https://img.clerk.com data:; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:; frame-src 'self' https://challenges.cloudflare.com https://*.protect.clerk.com; form-action 'self';"
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
            `script-src 'self' 'unsafe-inline' https://${fapiHost} https://challenges.cloudflare.com https://*.protect.clerk.com`,
            `connect-src 'self' https://${fapiHost} https://*.protect.clerk.com https://clerk-telemetry.com`,
            "img-src 'self' https://img.clerk.com data:",
            "style-src 'self' 'unsafe-inline'",
            "worker-src 'self' blob:",
            "frame-src 'self' https://challenges.cloudflare.com https://*.protect.clerk.com",
            "form-action 'self'",
          ].join('; '),
        ],
      },
    });
  });
});
```

> [!NOTE]
> HMR needs looser rules when the renderer loads from a dev server such as Vite. Add `'unsafe-eval'` to `script-src` and your dev server's origin to `connect-src` (for example, `ws://localhost:<port> http://localhost:<port>`). Many apps skip CSP during development and apply it only to packaged builds.

## Passkeys

Passkeys work in two modes. Clerk picks one for each request:

- **Renderer mode**: when your window loads content over `https://` from an origin that matches your passkey RP (Relying Party) ID, the renderer uses Chromium's built-in WebAuthn. The OS or browser syncs credentials. Windows Hello works without setup. Touch ID on macOS requires Electron 42 or later and [`app.configureWebAuthn`](https://www.electronjs.org/docs/latest/api/app#appconfigurewebauthnoptions-macos).
- **Native mode**: when your window loads a local bundle such as `scheme://host`, WebAuthn's origin checks reject the request. Clerk sends the ceremony over IPC to the main process instead. The optional [`@clerk/electron-passkeys`](https://github.com/clerk/javascript/tree/main/packages/electron-passkeys) native module then calls the OS WebAuthn APIs (AuthenticationServices on macOS, `webauthn.dll` on Windows).

Passkey autofill relies on WebAuthn conditional mediation, which only the renderer can provide. In native mode, the sign-in form offers passkeys through the "Use passkey" action instead. It never opens a passkey prompt on its own.

### Setup

Native mode requires the optional native module:

```sh
pnpm add @clerk/electron-passkeys
```

```ts
// main process
import { createClerkBridge } from '@clerk/electron';
import { storage } from '@clerk/electron/storage';

createClerkBridge({ storage: storage(), passkeys: true });
```

```ts
// preload script
import { exposeClerkBridge } from '@clerk/electron/preload';

exposeClerkBridge({ passkeys: true });
```

```tsx
// renderer process (React)
import { ClerkProvider } from '@clerk/electron/react';
import { passkeys } from '@clerk/electron/passkeys';

<ClerkProvider
  publishableKey={publishableKey}
  passkeys={passkeys}
>
  {/* ... */}
</ClerkProvider>;
```

Your app only bundles and initializes passkey code when you pass the `passkeys` prop. If you manage the Clerk instance yourself instead of using `ClerkProvider`, wire it up before `clerk.load()`:

```ts
// renderer process (vanilla)
import { Clerk } from '@clerk/clerk-js';
import { createPasskeyProvider } from '@clerk/electron/passkeys';

const clerk = new Clerk(publishableKey);
createPasskeyProvider(clerk);
await clerk.load();
```

### macOS requirements for native mode

Like passkeys on iOS, the macOS platform APIs require a verified association between your app and your domain:

1. In the Clerk Dashboard, go to the [Native applications](https://dashboard.clerk.com/~/native-applications) page and make sure the Native API is enabled. Your Electron app needs it.
2. Add an iOS application to the [Native applications](https://dashboard.clerk.com/~/native-applications) page in the Clerk Dashboard. You need your app's App ID Prefix and Bundle ID. An Electron macOS app uses the same configuration as an iOS app.
3. Sign your app with `com.apple.developer.associated-domains` containing `webcredentials:<rp-domain>`. This is a _restricted_ entitlement. The build must embed a provisioning profile with the Associated Domains capability for the bundle ID, and the entitlements must also include `com.apple.application-identifier` and `com.apple.developer.team-identifier` matching the profile.

Each of these mistakes produces the same opaque "not associated with domain" error:

- Sign with an **Apple Development** identity (`mac.type: development` in electron-builder) and a **macOS App Development** profile that includes your Mac. Also install the profile on the machine (`~/Library/Developer/Xcode/UserData/Provisioning Profiles/<UUID>.provisionprofile`).
- Copy `.app` bundles with `ditto`. Other copy methods can break the app seal, and macOS ignores the entitlements of an app whose signature fails `codesign --verify --deep --strict`.
- `swcd` registers the domain association when the app launches. Check it with `sudo swcutil show`. If it gets stuck, run `sudo swcutil reset` and relaunch.
- Prefer the default (production/CDN) association route. `?mode=developer` with `sudo swcutil developer-mode -e true` also works, but it's often flaky.

Windows has no equivalent requirement. Linux has no native mode, so passkeys only work in renderer mode there. External security keys work too.

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
