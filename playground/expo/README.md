# Running the Example Project with Clerk on Your iOS Simulator or Device

## Prerequisites

- Ensure you have Xcode installed and access to an Apple Developer Account.

## Steps

### Initiate project
In the project root, run:

```bash
   pnpm install
```
```bash
   cp app.json.example app.json
```

### Configure app.json

Replace the following placeholder with your configs

- ${YOUR_BUNDLE_IDENTIFIER}
- ${PACKAGE_NAME}

If you don't want to test passkeys remove the `associatedDomains` and `intentFilters`.


### Set Up Environment Variables

Add the `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` to the `.env`.


### Prebuild the Project

```bash
   pnpm expo prebuild --clean
```

### Run the Project

```bash
  pnpm run ios
```

Or 

```bash
  pnpm run android
```

### Troubleshooting

If you get the following error  `Error: TreeFS: Could not add directory node_modules`,
terminate the ios or android emulator and run again `npm i`

## Testing the Passkey Feature

### Configure Associated Domains for iOS

1. Log into your Clerk Dashboard, open the Native applications, and, for testing purposes, consider using a development instance.
2. Set up your Associated Domains. To do this, you'll need:
   - An Apple Developer account
   - Your App ID Prefix and Bundle ID, available at Apple's Developer portal
3. In `app.json`, replace the `associatedDomains` entry with the front-end API domain provided by Clerk (e.g., `coyote-6.clerk.accounts.dev`).
4. Also update the `bundleIdentifier` in `app.json` to match your Bundle ID from the Apple Developer portal.

### How to use the passkeys

1. Go to your Clerk Dashboard and enable Passkeys in the Email, Phone, Username settings.
2. Create a user in the Users tab on the dashboard, using email and password as the authentication attributes.
3. Open the app on your device or simulator, sign in with the user you just created.
4. After signing in, select the option to Create a Passkey and follow the prompts to register your passkey.
5. Sign out, and on the login screen, choose the Sign in with Passkey option to test the feature.


