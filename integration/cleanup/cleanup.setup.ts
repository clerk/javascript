import { createClerkClient } from '@clerk/backend';
import { parsePublishableKey } from '@clerk/shared/keys';
import { isStaging } from '@clerk/shared/utils';
import { test as setup } from '@playwright/test';

import { appConfigs } from '../presets/';

setup('cleanup instances ', async () => {
  const entries = Array.from(appConfigs.secrets.instanceKeys.values())
    .map(({ pk, sk }) => {
      const secretKey = sk;
      if (!secretKey) {
        return null;
      }
      const parsedPk = parsePublishableKey(pk);
      const apiUrl = isStaging(parsedPk.frontendApi) ? 'https://api.clerkstage.dev' : 'https://api.clerk.com';
      return { secretKey, apiUrl };
    })
    .filter(Boolean);

  for (const entry of entries) {
    console.log(`Cleanup for ${entry.secretKey.replace(/(sk_(test|live)_)(.+)(...)/, '$1***$4')}`);
    const clerkClient = createClerkClient({ secretKey: entry.secretKey, apiUrl: entry.apiUrl });
    const { data: usersWithEmail } = await clerkClient.users.getUserList({
      orderBy: '-created_at',
      query: 'clerkcookie',
      limit: 150,
    });

    const { data: usersWithPhoneNumber } = await clerkClient.users.getUserList({
      orderBy: '-created_at',
      query: '55501',
      limit: 150,
    });

    const users = [...usersWithEmail, ...usersWithPhoneNumber];

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
            `Cleaning up user ${user.id} (${user.emailAddresses?.[0]?.emailAddress || user.phoneNumbers?.[0]?.phoneNumber}) (${new Date(
              user.createdAt,
            ).toISOString()})`,
          );
          return clerkClient.users.deleteUser(user.id).catch(error => {
            console.error(`Error deleting user ${user.id}:`, error);
          });
        }),
      );
      await new Promise(r => setTimeout(r, 1000));
    }

    for (const batch of orgsToDelete) {
      console.log(`Starting batch...`);
      await Promise.all(
        batch.map(org => {
          console.log(`Cleaning up org ${org.id} (${org.name}) (${new Date(org.createdAt).toISOString()})`);
          return clerkClient.organizations.deleteOrganization(org.id).catch(error => {
            console.error(`Error deleting org ${org.id}:`, error);
          });
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
