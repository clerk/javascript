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
  await clerkClient.actorTokens.deleteUserPasskey({
    userId: 'user_xxxxxx',
    passkeyIdentificationId: 'xxxxxxx',
  });
  await clerkClient.actorTokens.deleteUserWeb3Wallet({
    userId: 'user_xxxxxx',
    web3WalletIdentificationId: 'xxxxxxx',
  });
  await clerkClient.actorTokens.deleteUserExternalAccount({
    userId: 'user_xxxxxx',
    externalAccountId: 'xxxxxxx',
  });
  await clerkClient.actorTokens.deleteUserBackupCodes('user_xxxxxx');
  await clerkClient.actorTokens.deleteUserTOTP('user_xxxxxx');
```