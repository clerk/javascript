<p align="center">
  <a href="https://clerk.com?utm_source=github&utm_medium=clerk_expo" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://images.clerk.com/static/logo-dark-mode-400x400.png">
      <img src="https://images.clerk.com/static/logo-light-mode-400x400.png" height="64">
    </picture>
  </a>
  <br />
</p>

# @clerk/clerk-expo

<div align="center">

[![Chat on Discord](https://img.shields.io/discord/856971667393609759.svg?logo=discord)](https://clerk.com/discord)
[![Clerk documentation](https://img.shields.io/badge/documentation-clerk-green.svg)](https://clerk.com/docs?utm_source=github&utm_medium=clerk_expo)
[![Follow on Twitter](https://img.shields.io/twitter/follow/ClerkDev?style=social)](https://twitter.com/intent/follow?screen_name=ClerkDev)

[Changelog](https://github.com/clerk/javascript/blob/main/packages/expo/CHANGELOG.md)
·
[Report a Bug](https://github.com/clerk/javascript/issues/new?assignees=&labels=needs-triage&projects=&template=BUG_REPORT.yml)
·
[Request a Feature](https://github.com/clerk/javascript/issues/new?assignees=&labels=feature-request&projects=&template=FEATURE_REQUEST.yml)
·
[Ask a Question](https://github.com/clerk/javascript/discussions)

</div>

---

## Overview

Clerk is the easiest way to add authentication and user management to your Expo application. Add sign up, sign in, and profile management to your React Native application in minutes.

## Getting Started

### Prerequisites

- React v16+
- Node.js v14+
- An application built using Expo

If an expo app already exists, you can skip this section and go straight to Installation.
Otherwise, you can create a new Expo app by running:

```
npx create-expo-app my-app
cd my-app
```

### Installation

Next, install the Clerk Expo SDK:

```sh
npm install @clerk/clerk-expo
```

### Usage

Clerk requires your application to be wrapped in the `<ClerkProvider/>` context and passed your Publishable Key the `publishableKey` prop.

With Expo, the entry point is typically `App.js`:

```jsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { ClerkProvider } from '@clerk/clerk-expo';

export default function App() {
  return (
    <ClerkProvider publishableKey={'your-publishable-key'}>
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <StatusBar style='auto' />
      </View>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

A token cache is required to work with Clerk and Expo. This is entirely up to you how you handle the token cache - in this example we're going to use the `expo-secure-store` library. First, install it by running

```
npm i expo-secure-store
```

and then add the tokenCache to your entry file, as shown here:

```diff
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { ClerkProvider } from "@clerk/clerk-expo";
+ import * as SecureStore from "expo-secure-store";

+ const tokenCache = {
+  getToken(key) {
+    try {
+     return SecureStore.getItemAsync(key);
+    }
+    catch (err) {
+     return null;
+    }
+  },
+  saveToken(key, value) {
+    try {
+     return SecureStore.setItemAsync(key, value);
+    }
+    catch (err) {
+     return null;
+    }
+  },
+};

export default function App() {
  return (
    <ClerkProvider
      publishableKey={"your-publishable-key"}
+     tokenCache={tokenCache}
    >
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <StatusBar style="auto" />
      </View>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

```

_The section above covers the basic setup. For further details and examples, please refer to our [Clerk Expo Documentation](https://clerk.com/docs?utm_source=github&utm_medium=clerk_expo)._

## Support

You can get in touch with us in any of the following ways:

- Join our official community [Discord server](https://clerk.com/discord)
- Create a [GitHub Discussion](https://github.com/clerk/javascript/discussions)
- Contact options listed on [our Support page](https://clerk.com/support?utm_source=github&utm_medium=clerk_expo)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/clerk/javascript/blob/main/docs/CONTRIBUTING.md).

## Security

`@clerk/clerk-expo` follows good practices of security, but 100% security cannot be assured.

`@clerk/clerk-expo` is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](https://github.com/clerk/javascript/blob/main/docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/clerk/javascript/blob/main/packages/expo/LICENSE) for more information.
