---
'@clerk/electron-passkeys': patch
---

Introduce native passkey (WebAuthn) support for Clerk's Electron SDK, with prebuilt binaries for macOS (arm64 and x64) and Windows (arm64 and x64). Installing the package automatically pulls in the matching platform binary, so passkeys work without a local build toolchain.
