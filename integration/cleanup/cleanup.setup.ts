import type { User } from '@clerk/backend';
import { createClerkClient } from '@clerk/backend';
import { test as setup } from '@playwright/test';

import { appConfigs } from '../presets/';

setup('cleanup instances ', async () => {
  const entries = Object.values(appConfigs.envs)
    .map(e => e.toJson())
    .map(json => {
      const secretKey = json.private['CLERK_SECRET_KEY'];
      if (!secretKey) {
        return null;
      }
      return { secretKey, apiUrl: json.private['CLERK_API_URL'] };
    })
    .filter(Boolean);

  for (const entry of entries) {
    console.log(`Cleanup for ${entry!.secretKey.replace(/(sk_test_)(.+)(...)/, '$1***$3')}`);
    const clerkClient = createClerkClient({ secretKey: entry!.secretKey, apiUrl: entry?.apiUrl });
    const { data: users } = await clerkClient.users.getUserList({
      orderBy: '-created_at',
      query: 'clerkcook',
      limit: 150,
    });

    const batches = batchElements(skipUsersThatWereCreatedWithinTheLast10Minutes(users), 5);
    for (const batch of batches) {
      console.log(`Starting batch...`);
      await Promise.all(
        batch.map(user => {
          console.log(
            `Cleaning up user ${user.id} (${user.emailAddresses[0]?.emailAddress}) (${new Date(
              user.createdAt,
            ).toISOString()})`,
          );
          return clerkClient.users.deleteUser(user.id);
        }),
      );
      await new Promise(r => setTimeout(r, 1000));
    }
  }
});

const skipUsersThatWereCreatedWithinTheLast10Minutes = (users: User[]): User[] => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  return users.filter(user => new Date(user.createdAt) < tenMinutesAgo);
};

function batchElements<T>(users: T[], batchSize = 5): T[][] {
  const batches = [];
  for (let i = 0; i < users.length; i += batchSize) {
    batches.push(users.slice(i, i + batchSize));
  }
  return batches;
}
