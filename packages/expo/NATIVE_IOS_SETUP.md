# Native iOS Setup for @clerk/clerk-expo

This guide explains how to use Clerk's native iOS components in your Expo or React Native application.

## Overview

`@clerk/clerk-expo` supports two implementations:

1. **Native-First (Recommended)**: Uses Clerk's native iOS Swift UI components for the best user experience
2. **React Native**: Cross-platform React Native components that work everywhere

## Feature Comparison

| Feature              | Native iOS (Swift UI)                | React Native                    |
| -------------------- | ------------------------------------ | ------------------------------- |
| **UI/UX**            | Native iOS design, follows Apple HIG | Cross-platform design           |
| **Performance**      | Native Swift performance             | JavaScript bridge overhead      |
| **Bundle Size**      | Smaller JS bundle                    | Larger JS bundle                |
| **Customization**    | Limited to Clerk iOS theming         | Full React Native customization |
| **Platform Support** | iOS only                             | iOS, Android, Web               |
| **Build Method**     | Requires native build (EAS/Xcode)    | Works with Expo Go              |
| **Face ID/Touch ID** | Native biometric integration         | Via expo-local-authentication   |
| **Passkeys**         | Native passkey support               | Limited support                 |
| **OAuth**            | Native SFAuthenticationSession       | WebBrowser-based                |

---

## Setup Instructions

### For Expo Users (Recommended)

#### Prerequisites

- Expo SDK 50 or later
- EAS Build account (native builds required)
- iOS deployment target 15.1+

#### 1. Install the Package

```bash
npx expo install @clerk/clerk-expo
```

#### 2. Add the Expo Config Plugin

In your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [["@clerk/clerk-expo/app.plugin"]]
  }
}
```

#### 3. Configure Your App

```tsx
// app/_layout.tsx
import { ClerkProvider } from '@clerk/clerk-expo';

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      {/* Your app content */}
    </ClerkProvider>
  );
}
```

#### 4. Use Native Components

```tsx
// app/(auth)/sign-in.tsx
import { SignIn } from '@clerk/clerk-expo/native';
import { useRouter } from 'expo-router';

export default function SignInScreen() {
  const router = useRouter();

  return (
    <SignIn
      mode='signIn'
      onSuccess={() => router.replace('/(home)')}
      onError={error => console.error('Sign in error:', error)}
    />
  );
}
```

#### 5. Build with EAS

The native iOS components require a native build:

```bash
# Development build
eas build --profile development --platform ios

# Install on simulator
eas build:run --profile development --platform ios

# Production build
eas build --profile production --platform ios
```

**Important**: Native iOS components **will not work** with Expo Go. You must create a development build.

---

### For React Native CLI Users

If you're using React Native without Expo, you'll need to manually add the clerk-ios Swift package.

#### Prerequisites

- React Native 0.70 or later
- CocoaPods
- Xcode 14+
- iOS deployment target 15.1+

#### 1. Install the Package

```bash
npm install @clerk/clerk-expo
# or
yarn add @clerk/clerk-expo
```

#### 2. Install iOS Dependencies

```bash
cd ios && pod install && cd ..
```

#### 3. Add clerk-ios Swift Package in Xcode

1. Open your `.xcworkspace` file in Xcode
2. Select your project in the Project Navigator
3. Select your app target
4. Go to the "Package Dependencies" tab
5. Click the "+" button
6. Enter the repository URL: `https://github.com/clerk/clerk-ios.git`
7. Select "Up to Next Major Version" with minimum version `0.68.1`
8. Ensure the "Clerk" product is selected for your target
9. Click "Add Package"

#### 4. Verify Installation

Build your project to ensure the Swift package is properly linked:

```bash
npx react-native run-ios
```

---

## Using React Native Components Instead

If you want to use the cross-platform React Native components (works with Expo Go), import from the main package:

```tsx
import { SignIn } from '@clerk/clerk-expo';
// NOT from '@clerk/clerk-expo/native'
```

### When to Use React Native Components

- Testing in Expo Go
- Need Android support
- Want full UI customization
- Don't need native iOS features (Face ID, Passkeys)

### When to Use Native iOS Components

- Building a production iOS app
- Want the best iOS user experience
- Need native biometric authentication
- Want smaller JavaScript bundle size
- Need passkey support

---

## API Reference

### Native SignIn Component

```tsx
import { SignIn } from '@clerk/clerk-expo/native';

<SignIn
  mode="signIn" | "signUp" | "signInOrUp"
  isDismissable={boolean}
  onSuccess={(data) => void}
  onError={(error) => void}
/>
```

**Props:**

- `mode`: Authentication mode (default: `"signInOrUp"`)
- `isDismissable`: Whether the view can be dismissed (default: `true`)
- `onSuccess`: Callback when authentication succeeds
- `onError`: Callback when authentication fails

---

## Troubleshooting

### "Module 'Clerk' not found"

The clerk-ios Swift package isn't installed. Follow the manual setup steps above.

### "Expo Go doesn't show native components"

Native components require a development build. Run `eas build --profile development --platform ios`.

### Plugin doesn't add Swift package

The config plugin only runs during `expo prebuild` or `eas build`. If you're using a bare workflow, you'll need to add the package manually in Xcode.

### Build fails with Swift errors

Ensure your iOS deployment target is at least 15.1 in your `Podfile`:

```ruby
platform :ios, '15.1'
```

---

## Migration Guide

### From React Native Components to Native

1. Change your imports:

```tsx
// Before
import { SignIn } from '@clerk/clerk-expo';

// After
import { SignIn } from '@clerk/clerk-expo/native';
```

2. Create a development build (can't use Expo Go)
3. Test on a physical device or simulator

### From Native to React Native

1. Change your imports back:

```tsx
// Before
import { SignIn } from '@clerk/clerk-expo/native';

// After
import { SignIn } from '@clerk/clerk-expo';
```

2. Can now use Expo Go for testing

---

## Additional Resources

- [Clerk iOS SDK Documentation](https://github.com/clerk/clerk-ios)
- [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Clerk Dashboard](https://dashboard.clerk.com/)

---

## Support

For issues related to:

- Native iOS components: [clerk-ios repository](https://github.com/clerk/clerk-ios/issues)
- Expo integration: [clerk-javascript repository](https://github.com/clerk/javascript/issues)
- General Clerk questions: [Clerk Discord](https://clerk.com/discord)
