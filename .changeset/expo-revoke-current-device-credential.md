---
'@clerk/expo': minor
---

Add `revokeCurrentDeviceCredential()` to `useBiometricCredentials()`. It revokes the biometric credential enrolled by this app installation for the current user, so you no longer need to store the credential ID returned by `enroll()`. It resolves with the revoked credential, or `null` when this installation has no credential for the current user.

```tsx
import { useBiometricCredentials } from '@clerk/expo/biometrics';

const { revokeCurrentDeviceCredential } = useBiometricCredentials();

await revokeCurrentDeviceCredential();
```
