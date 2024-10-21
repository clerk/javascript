# Running the Example Project with Clerk on Your iOS Simulator or Device

## Steps

### Before executing this steps you will need to have XCode installed and have an Apple Developer Account

1. **Install module deps**  
   Run `npm i` on the root of the project.

2. **Navigate to the Example Folder**  
   Open your terminal and move into the `example` folder of the project.

3. **Set Up Environment Variables**  
   Add the `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` to the `.env` file in the root of your project.

4. **Configure Associated Domains**

   - Go to the iOS Application tab on the Clerk Dashboard. For testing purposes, it’s recommended to use a development instance.
   - Set up your associated domain file, which requires an Apple Developer account,You can find you App id prefix and Bundle ID at `https://developer.apple.com/account/resources/identifiers/list`
   - Replace the `associatedDomains` entry in `app.json` with the front end api provided by Clerk e.x `coyote-6.clerk.accounts.dev` .
   - Configure also the `bundleIdentifier` in `app.json` to match the bundle id that can be found at `https://developer.apple.com/account/resources/identifiers/list`

5. **Install Dependencies**  
   Run `npm install`.

6. **Prebuild the Project**  
   Run `npx expo prebuild --clean`.

7. **Run the Project on iOS**  
   Run `npm run ios`

8. **How to use the example**

- Navigate to Dashboard and enable the passkeys attribute at Email, Phone, Username page.
- Navigate to dashboard and create a new user from the Users tab, use only email and password as authentication attributes.
- Open your the device that you application is running and sign in with the user that you just created.
- After signing in you will see a screen that has an option to create a Passkey, press that option and register your passkey.
- Sign out
- In the sign in screen select the option sign in with passkey
