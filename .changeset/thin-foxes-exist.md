---
'@clerk/backend': patch
---

Adds the following User-centric functionality to the Backend API client.


```ts
  import { createClerkClient } from '@clerk/backend';

  const clerkClient = createClerkClient(...);

  await clerkClient.users.getOrganizationInvitationList({
    userId: 'user_xxxxxx',
    status: 'pending',
  });
  await clerkClient.users.deleteUserPasskey({
    userId: 'user_xxxxxx',
    passkeyIdentificationId: 'xxxxxxx',
  });
  await clerkClient.users.deleteUserWeb3Wallet({
    userId: 'user_xxxxxx',
    web3WalletIdentificationId: 'xxxxxxx',
  });
  await clerkClient.users.deleteUserExternalAccount({
    userId: 'user_xxxxxx',
    externalAccountId: 'xxxxxxx',
  });
  await clerkClient.users.deleteUserBackupCodes('user_xxxxxx');
  await clerkClient.users.deleteUserTOTP('user_xxxxxx');
```