# @clerk/expo-passkeys

## 0.0.2

### Patch Changes

- Introduce experimental support for passkeys in Expo (iOS, Android, and Web). ([#4352](https://github.com/clerk/javascript/pull/4352)) by [@AlexNti](https://github.com/AlexNti)

  To use passkeys in Expo projects, pass the `__experimental_passkeys` object, which can be imported from `@clerk/clerk-expo/passkeys`, to the `ClerkProvider` component:

  ```tsx
  import { ClerkProvider } from '@clerk/clerk-expo';
  import { passkeys } from '@clerk/clerk-expo/passkeys';

  <ClerkProvider __experimental_passkeys={passkeys}>{/* Your app here */}</ClerkProvider>;
  ```

  The API for using passkeys in Expo projects is the same as the one used in web apps:

  ```tsx
  // passkey creation
  const { user } = useUser();

  const handleCreatePasskey = async () => {
    if (!user) return;
    try {
      return await user.createPasskey();
    } catch (e: any) {
      // handle error
    }
  };

  // passkey authentication
  const { signIn, setActive } = useSignIn();

  const handlePasskeySignIn = async () => {
    try {
      const signInResponse = await signIn.authenticateWithPasskey();
      await setActive({ session: signInResponse.createdSessionId });
    } catch (err: any) {
      //handle error
    }
  };
  ```

- Updated dependencies [[`5a21de1f46df3642828dc27e4862263c9858da2b`](https://github.com/clerk/javascript/commit/5a21de1f46df3642828dc27e4862263c9858da2b), [`f7472e22877f62fc7f3c8d3efe409ff2276fb4a3`](https://github.com/clerk/javascript/commit/f7472e22877f62fc7f3c8d3efe409ff2276fb4a3), [`e199037b8f484abdeeb9fc24455a1b4b8c31c8dd`](https://github.com/clerk/javascript/commit/e199037b8f484abdeeb9fc24455a1b4b8c31c8dd), [`886e294a8d8c54b39cd5bda88d46b89eace3861e`](https://github.com/clerk/javascript/commit/886e294a8d8c54b39cd5bda88d46b89eace3861e), [`0e443ad7c76643420b50e5b169193e03f6ef79f9`](https://github.com/clerk/javascript/commit/0e443ad7c76643420b50e5b169193e03f6ef79f9), [`cc24c8145f1eea7fb91550f2c3e0bac3993e4320`](https://github.com/clerk/javascript/commit/cc24c8145f1eea7fb91550f2c3e0bac3993e4320)]:
  - @clerk/shared@2.12.0
  - @clerk/types@4.31.0
