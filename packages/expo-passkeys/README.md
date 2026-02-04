<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_expo_passkeys" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
  <h1 align="center">@clerk/expo-passkeys</h1>
</p>

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=expo_passkeys)
[![Follow on Twitter](https://img.shields.io/twitter/follow/Clerk?style=social)](https://twitter.com/intent/follow?screen_name=Clerk)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/expo-passkeys/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://feedback.clerk.com/roadmap)
·
[Get help](https://clerk.com/contact/support?utm_source=github&utm_medium=expo_passkeys)

</div>

### Prerequisites

- Expo 51 or later
- React 18.0.2 or later
- React Native 0.73 or later
- Node.js `>=18.17.0` or later
- An existing Expo application.
- An existing Clerk application. [Create your account for free](https://dashboard.clerk.com/sign-up?utm_source=github&utm_medium=expo_passkeys).
- [Passkeys to be enabled ](https://clerk.com/docs/custom-flows/passkeys#enable-passkeys)

## Usage

```tsx
import { ClerkProvider } from '@clerk/expo';
import { passkeys } from '@clerk/expo/passkeys';

<ClerkProvider __experimental_passkeys={passkeys}>{/* Your app here */}</ClerkProvider>;
```

### 🔑 Creating a Passkey

```tsx
const { user } = useUser();

const handleCreatePasskey = async () => {
  if (!user) return;
  try {
    return await user.createPasskey();
  } catch (e: any) {
    // handle error
  }
};
```

### 🔓 Authenticating with a Passkey

```tsx
const { signIn, setActive } = useSignIn();

const handlePasskeySignIn = async () => {
  try {
    const signInResponse = await signIn.authenticateWithPasskey();
    await setActive({ session: signInResponse.createdSessionId });
  } catch (err: any) {
    // handle error
  }
};
```

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- On [our support page](https://clerk.com/contact/support?utm_source=github&utm_medium=expo_passkeys)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md) and [code of conduct](https://github.com/clerk/javascript/blob/main/docs/CODE_OF_CONDUCT.md).

## Security

`@clerk/expo-passkeys` follows good practices of security, but 100% security cannot be assured.

`@clerk/expo-passkeys` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/expo-passkeys/LICENSE) for more information.
