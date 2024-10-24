---
"@clerk/clerk-js": minor
"@clerk/shared": minor
"@clerk/types": minor
"@clerk/clerk-expo": minor
---

feat: Add support for passkeys in Expo projects (iOS, Android, and Web).

To use passkeys in Expo projects, we need to pass the `passkeys` object, which can be imported from `@clerk/clerk-expo-passkeys`, to the `ClerkProvider` component:

```tsx

import { ClerkProvider } from '@clerk/clerk-expo';
import { passkeys } from '@clerk/clerk-expo/passkeys';

<ClerkProvider passkeys={passkeys}>
  {/* Your app here */}
</ClerkProvider>
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
