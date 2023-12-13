import type { User } from '@clerk/backend';
import { createClerkClient } from '@clerk/backend';
import { test as setup } from '@playwright/test';

import { appConfigs } from '../presets/';

setup('cleanup instances ', async () => {
  const secretKeys = Object.values(appConfigs.envs)
    .map(e => e.toJson())
    .map(json => json.private)
    .map(keys => keys['CLERK_SECRET_KEY'])
    .filter(Boolean);

  for (const secretKey of secretKeys) {
    console.log(`Cleanup for ${secretKey.replace(/(sk_test_)(.+)(...)/, '$1***$3')}`);
    const clerkClient = createClerkClient({ secretKey });
    const { data: users, errors } = await clerkClient.users.getUserList({
      orderBy: '-created_at',
      query: 'clerkcookie',
      limit: 100,
    });

    if (errors) {
      console.log(errors);
      return;
    }

    const batches = batchElements(skipUsersThatWereCreatedToday(users), 5);
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

const skipUsersThatWereCreatedToday = (users: User[]): User[] => {
  const today = new Date();
  const todayString = today.toISOString().slice(0, 10);
  return users.filter(user => new Date(user.createdAt).toISOString().slice(0, 10) !== todayString);
};

function batchElements<T>(users: T[], batchSize = 5): T[][] {
  const batches = [];
  for (let i = 0; i < users.length; i += batchSize) {
    batches.push(users.slice(i, i + batchSize));
  }
  return batches;
}
