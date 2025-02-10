import { createClerkClient } from '@clerk/backend';
import { test as setup } from '@playwright/test';

import { appConfigs } from '../presets/';

setup('cleanup instances ', async () => {
  const entries = Array.from(appConfigs.secrets.instanceKeys.values())
    .map(({ sk }) => {
      const secretKey = sk;
      if (!secretKey) {
        return null;
      }
      return { secretKey };
    })
    .filter(Boolean);

  for (const entry of entries) {
    console.log(`Cleanup for ${entry.secretKey.replace(/(sk_test_)(.+)(...)/, '$1***$3')}`);
    const clerkClient = createClerkClient({ secretKey: entry.secretKey });
    const { data: users } = await clerkClient.users.getUserList({
      orderBy: '-created_at',
      query: 'clerkcookie',
      limit: 150,
    });

    const { data: orgs } = await clerkClient.organizations
      .getOrganizationList({
        limit: 150,
      })
      .catch(() => ({ data: [] }));

    const usersToDelete = batchElements(skipObjectsThatWereCreatedWithinTheLast10Minutes(users), 5);
    const orgsToDelete = batchElements(skipObjectsThatWereCreatedWithinTheLast10Minutes(orgs), 5);

    for (const batch of usersToDelete) {
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

    for (const batch of orgsToDelete) {
      console.log(`Starting batch...`);
      await Promise.all(
        batch.map(org => {
          console.log(`Cleaning up org ${org.id} (${org.name}) (${new Date(org.createdAt).toISOString()})`);
          return clerkClient.organizations.deleteOrganization(org.id);
        }),
      );
      await new Promise(r => setTimeout(r, 1000));
    }
  }
});

const skipObjectsThatWereCreatedWithinTheLast10Minutes = <T extends { createdAt: string }>(objects: T[]): T[] => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  return objects.filter(object => new Date(object.createdAt) < tenMinutesAgo);
};

function batchElements<T>(objects: T[], batchSize = 5): T[][] {
  const batches = [];
  for (let i = 0; i < objects.length; i += batchSize) {
    batches.push(objects.slice(i, i + batchSize));
  }
  return batches;
}
