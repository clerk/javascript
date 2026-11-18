# @clerk/electron-passkeys

Native passkey (WebAuthn) support for [`@clerk/electron`](https://github.com/clerk/javascript/tree/main/packages/electron), used when an Electron window loads a local bundle (`file://` or a custom protocol) and the renderer's built-in WebAuthn cannot satisfy the RP ID's origin checks.

> [!WARNING]
> This package is under active development and is not yet ready for production use.

This package is a napi-rs native module loaded in the Electron **main** process by `createClerkBridge({ passkeys: true })` from `@clerk/electron`. You should not need to call it directly.

| Platform         | Backend                                              | Authenticators                           |
| ---------------- | ---------------------------------------------------- | ---------------------------------------- |
| macOS 12+        | AuthenticationServices (`ASAuthorizationController`) | Touch ID, iCloud Keychain, security keys |
| Windows 10 1903+ | `webauthn.dll` (Windows WebAuthn API)                | Windows Hello, security keys             |
| Linux            | —                                                    | Not supported (use renderer WebAuthn)    |

Prebuilt binaries ship as per-platform optional dependencies (`@clerk/electron-passkeys-darwin-arm64`, `-darwin-x64`, `-win32-x64-msvc`, `-win32-arm64-msvc`).

## API

```ts
isAvailable(): boolean;
capabilities(): { platformAuthenticator: boolean; securityKeys: boolean };
createCredential(windowHandle: Buffer, optionsJson: string): Promise<string>;
getCredential(windowHandle: Buffer, optionsJson: string): Promise<string>;
```

`createCredential`/`getCredential` take the window handle from `BrowserWindow#getNativeWindowHandle()` (to anchor the OS dialog) and JSON-encoded WebAuthn options with base64url binary fields. They always resolve with a JSON envelope — `{ ok: true, credential }` or `{ ok: false, error: { code, message } }` with `code` one of `cancelled | invalid_rp | not_supported | timeout | unknown` — and never reject for ceremony failures.

## Building from source

Requires a Rust toolchain.

```sh
pnpm --filter @clerk/electron-passkeys build
```

## License

MIT — see [LICENSE](https://github.com/clerk/javascript/blob/main/packages/electron/LICENSE).
