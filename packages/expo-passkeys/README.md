# Running the Example Project with Clerk on Your iOS Simulator or Device

## Prerequisites

- Ensure you have Xcode installed and access to an Apple Developer Account.

## Steps

### 1. Install Project Dependencies

In the project root, run:

```bash
   npm install
```

### 2. Navigate to the Example Folder

```bash
   cd example
```

### 3. Set Up Environment Variables

Add the `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` to the `.env`.

### 4. Configure Associated Domains for iOS

1. Log into your Clerk Dashboard, open the iOS Application tab, and, for testing purposes, consider using a development instance.
2. Set up your Associated Domains. To do this, you'll need:
   - An Apple Developer account
   - Your App ID Prefix and Bundle ID, available at Apple's Developer portal
3. In `app.json`, replace the `associatedDomains` entry with the front-end API domain provided by Clerk (e.g., `coyote-6.clerk.accounts.dev`).
4. Also update the `bundleIdentifier` in `app.json` to match your Bundle ID from the Apple Developer portal.

### 5. Install Example Dependencies

Run `npm install` within the example folder.

### 6. Prebuild the Project

```bash
   npx expo prebuild --clean
```

### 7. Run the Project on iOS

```bash
  npm run ios
```

## Testing the Passkey Feature

1. Go to your Clerk Dashboard and enable Passkeys in the Email, Phone, Username settings.
2. Create a user in the Users tab on the dashboard, using email and password as the authentication attributes.
3. Open the app on your device or simulator, sign in with the user you just created.
4. After signing in, select the option to Create a Passkey and follow the prompts to register your passkey.
5. Sign out, and on the login screen, choose the Sign in with Passkey option to test the feature.
