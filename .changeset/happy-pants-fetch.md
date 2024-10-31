---
"@clerk/expo-passkeys": major
---

Introduction of the Clerk passkeys module, this module will a allow to handle the creation and retrieval of passkeys, can be integrated as follows:

```tsx
import { ClerkProvider } from '@clerk/clerk-expo';
import { passkeys } from '@clerk/clerk-expo/passkeys';

<ClerkProvider passkeys={passkeys}>
  {/* Your app here */}
</ClerkProvider>
``` 