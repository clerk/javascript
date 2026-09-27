<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_expo_native" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/expo-native</h1>
</p>

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_expo_native)
[![Follow on X](https://img.shields.io/twitter/follow/clerk?style=social)](https://x.com/intent/follow?screen_name=clerk)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/expo-native/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_expo_native)

</div>

## Getting Started

`@clerk/expo-native` adds Clerk's prebuilt native components to an Expo app that uses [`@clerk/expo`](https://github.com/clerk/javascript/tree/main/packages/expo). It contains the native modules built on the Clerk iOS and Android SDKs:

- **iOS**: [clerk-ios](https://github.com/clerk/clerk-ios) (SwiftUI)
- **Android**: [clerk-android](https://github.com/clerk/clerk-android) (Jetpack Compose)

Install it only if you use `AuthView`, `UserProfileView`, `UserButton`, or biometric credentials. Apps that only use `@clerk/expo` do not include the Clerk native SDKs.

### Prerequisites

- `@clerk/expo`
- Expo 54 or later, with a [development build](https://docs.expo.dev/develop/development-builds/introduction/) (Expo Go is not supported)
- iOS 17 or later

### Installation

```sh
npx expo install @clerk/expo @clerk/expo-native
```

Add the config plugin alongside `@clerk/expo` in your app config, then rebuild your native app:

```json
{
  "expo": {
    "plugins": ["@clerk/expo", "@clerk/expo-native"]
  }
}
```

The plugin accepts the following options:

- `keychainService`: keychain service identifier to share the session with app extensions.
- `theme`: path to a JSON file with `colors`, `darkColors`, and `design` keys that styles the native components.

## Usage

```tsx
import { useAuth } from '@clerk/expo';
import { AuthView } from '@clerk/expo-native';

export default function SignInScreen() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return null;
  }

  return <AuthView />;
}
```

For further information, guides, and examples visit the [Expo reference documentation](https://clerk.com/docs/references/expo/overview?utm_source=github&utm_medium=clerk_expo_native).

## Support

For help, visit our [support page](https://clerk.com/contact/support?utm_source=github&utm_medium=clerk_expo_native).

## Community

Join our [Discord community](https://clerk.com/discord) to connect with other developers.

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/expo-native` follows good practices of security, but 100% security cannot be assured.

`@clerk/expo-native` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/expo-native/LICENSE) for more information.
