<p align="center">
  <a href="https://clerk.dev?utm_source=github&utm_medium=clerk_expo" target="_blank" rel="noopener noreferrer">
    <img src="https://images.clerk.dev/static/clerk.svg" alt="Clerk logo" height="50">
  </a>
  <br />
</p>

# @clerk/clerk-expo

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://discord.com/invite/b5rXHjAg7A)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://docs.clerk.dev)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerkinc/javascript/blob/main/packages/expo/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=bug&template=bug_report.md&title=Bug%3A+)
·
[Request a Feature](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=Feature%3A+)
·
[Ask a Question](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)

</div>

---

## Overview

Clerk is the easiest way to add authentication and user management to your Expo application. Add sign up, sign in, and profile management to your React Native application in minutes.

## Getting Started

### Prerequisites

- React v16+
- Node.js v14+

### Installation

```sh
npm install @clerk/clerk-expo
```

### Build

To build the package locally with the TypeScript compiler, run:

```sh
npm run build
```

To build the package in watch mode, run the following:

```sh
npm run dev
```

## Usage

Clerk requires your application to be wrapped in the `<ClerkProvider/>` context and passed your Frontend API as the `frontendApi` prop.

With Expo, the entry point is typically `App.js`:

```jsx
import { ClerkProvider, useUser, withClerk } from '@clerk/clerk-expo';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const frontendApi = 'clerk.[your-domain].[tld]';

export default function App() {
  return (
    <ClerkProvider frontendApi={frontendApi}>
      <Main />
    </ClerkProvider>
  );
}

const Main = withClerk(({ clerk }) => {
  const { user } = useUser({ withAssertions: true });
  const handleSignIn = () => clerk.openSignIn();
  const handleSignOut = () => clerk.signOut();

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text>You are signed in</Text>
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text>Sign out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text>Sign in</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});
```

_For further details and examples, please refer to our [Documentation](https://docs.clerk.dev?utm_source=github&utm_medium=clerk_expo)._

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://discord.com/invite/b5rXHjAg7A)
- Open a [GitHub support issue](https://github.com/clerkinc/javascript/issues/new?assignees=&labels=question&template=ask_a_question.md&title=Support%3A+)
- Contact options listed on [our Support page](https://clerk.dev/support?utm_source=github&utm_medium=clerk_expo)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerkinc/javascript/blob/main/packages/expo/docs/CONTRIBUTING.md).

## Security

`@clerk/clerk-expo` follows good practices of security, but 100% security cannot be assured.

`@clerk/clerk-expo` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerkinc/javascript/blob/main/packages/expo/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerkinc/javascript/blob/main/packages/expo/LICENSE) for more information.
