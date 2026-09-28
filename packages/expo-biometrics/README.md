<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_expo_biometrics" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/expo-biometrics</h1>
</p>

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=expo_biometrics)
[![Follow on X](https://img.shields.io/twitter/follow/clerk?style=social)](https://x.com/intent/follow?screen_name=clerk)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/expo-biometrics/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=expo_biometrics)

</div>

> [!WARNING]
> This package is experimental. Pin its version, as breaking changes can happen in minor releases.

The native building block for Clerk biometric credentials in Expo apps. It creates hardware-backed signing keys, signs challenges behind a Face ID / Touch ID or Android biometric prompt, and stores the on-device records that link each key to a Clerk credential. It does not talk to Clerk's API; `@clerk/expo` builds the sign-in and enrollment flows on top of it.

The key and record layout is shared with the Clerk iOS and Android SDKs, so credentials enrolled by either SDK in the same app are visible to both.

### Prerequisites

- Expo SDK 54 or later, in a development build (the module is not available in Expo Go or on the web)
- iOS: `NSFaceIDUsageDescription` in your `Info.plist`. The `@clerk/expo` config plugin sets it through its `faceIDPermission` option.
- iOS: a device with a Secure Enclave. The iOS Simulator has none, so `createKey()` rejects there with `secure_key_storage_unavailable`.
- Android 9 (API level 28) or later with a strong (Class 3) biometric. On older versions `getAvailability()` reports `secureKeyStorageAvailable: false`, `createKey()` rejects with `secure_key_storage_unavailable`, and `sign()` with `biometry_not_available`.

## Installation

```sh
npx expo install @clerk/expo-biometrics
```

Then rebuild your native app.

## API

```ts
import {
  createKey,
  deleteKey,
  deleteRecord,
  ensureInstallationMarker,
  getAppIdentifier,
  getAvailability,
  hashIdentifierHint,
  hasKey,
  listRecords,
  saveRecord,
  sign,
} from '@clerk/expo-biometrics';
```

| Function                                       | Description                                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `getAppIdentifier()`                           | The app identifier sent to Clerk as `app_identifier` (the iOS bundle identifier or the Android package name).            |
| `hashIdentifierHint(hint)`                     | The SHA-256 of the trimmed, lowercased hint as lowercase hex, or `null` when it is empty.                                |
| `getAvailability()`                            | The device's biometry type, whether biometrics or device owner authentication can be evaluated, and secure key storage.  |
| `createKey(policy)`                            | Creates a Secure Enclave or Android Keystore P-256 key and returns its `localKeyId` and public key JWK.                  |
| `sign(localKeyId, clientData, reason?)`        | Prompts for authentication and returns an ES256 signature over `clientData` (raw `r \|\| s`, base64url without padding). |
| `hasKey(localKeyId)` / `deleteKey(localKeyId)` | Checks for or deletes a key.                                                                                             |
| `listRecords()`                                | Every stored credential record, for every app identifier, with its `identifierHintSha256`.                               |
| `saveRecord(record, options)`                  | Saves a record. With `removeOtherRecordsForApp: true`, deletes the app's other records and their keys.                   |
| `deleteRecord(localKeyId)`                     | Deletes a key, then the records that reference it.                                                                       |
| `ensureInstallationMarker()`                   | Deletes records and keys left behind by a previous installation of the app. The store functions call it for you.         |

### Platform differences

- Android stores only the hash of the identifier hint, so its records have `identifierHint: null`. Match hints by comparing `hashIdentifierHint(hint)` with `identifierHintSha256`, which both platforms return.
- On Android, `removeOtherRecordsForApp` deletes only the same user's other records; other users' records are left for the next sign-in to reconcile.
- Android reports `biometryType: 'biometric'`, since it does not say which sensor is a strong biometric.
- Android's `ensureInstallationMarker()` always resolves `{ wiped: false }`: uninstalling the app already deletes its records and keys.

Every error is a `ClerkBiometricsError` with a stable `code`, such as `user_canceled`, `biometry_not_enrolled`, `biometry_lockout`, `key_not_found`, or `storage_failed`.

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/expo-biometrics/LICENSE) for more information.
