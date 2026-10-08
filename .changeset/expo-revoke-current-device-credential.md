---
'@clerk/expo': minor
---

Add `revokeCurrentDeviceCredential()` to `useBiometricCredentials()`. It revokes this device's biometric credential for the signed-in user, so you no longer need to store the ID from `enroll()`. It returns the revoked credential, or `null` if there is nothing to revoke. Call it before signing out, since it needs a session.

```tsx
import { useBiometricCredentials } from '@clerk/expo/biometrics';

const { revokeCurrentDeviceCredential } = useBiometricCredentials();

await revokeCurrentDeviceCredential();
```
