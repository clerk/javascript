import { createClerkClient } from '@clerk/backend';
import { isClerkAPIResponseError } from '@clerk/shared/error';
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

  const errors: Array<{ instance: string; error: Error; operation: string }> = [];

  for (const entry of entries) {
    const instanceKey = entry.secretKey.replace(/(sk_(test|live)_)(.+)(...)/, '$1***$4');
    console.log(`Cleanup for ${instanceKey}`);

    try {
      const clerkClient = createClerkClient({ secretKey: entry.secretKey, apiUrl: entry.apiUrl });

      // Get users
      let users: any[] = [];
      try {
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

        users = [...usersWithEmail, ...usersWithPhoneNumber];
      } catch (error) {
        errors.push({ instance: instanceKey, error: error as Error, operation: 'getUserList' });
        console.error(`Error getting users for ${instanceKey}:`, error);
        users = []; // Continue with empty users list
      }

      // Get organizations
      let orgs: any[] = [];
      try {
        const { data: orgsData } = await clerkClient.organizations.getOrganizationList({
          limit: 150,
        });
        orgs = orgsData;
      } catch (error) {
        // Treat 404 (not found) and 403 (forbidden) as "no orgs"
        // 404 = no organizations exist, 403 = no permission to access organizations
        if (isClerkAPIResponseError(error) && (error.status === 404 || error.status === 403)) {
          orgs = [];
        } else {
          errors.push({ instance: instanceKey, error: error as Error, operation: 'getOrganizationList' });
          console.error(`Error getting organizations for ${instanceKey}:`, error);
          orgs = []; // Continue with empty orgs list
        }
      }

      const usersToDelete = batchElements(skipObjectsThatWereCreatedWithinTheLast10Minutes(users), 5);
      const orgsToDelete = batchElements(skipObjectsThatWereCreatedWithinTheLast10Minutes(orgs), 5);

      // Delete users
      for (const batch of usersToDelete) {
        console.log(`Starting user deletion batch...`);
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

      // Delete organizations
      for (const batch of orgsToDelete) {
        console.log(`Starting organization deletion batch...`);
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
    } catch (error) {
      errors.push({ instance: instanceKey, error: error as Error, operation: 'general' });
      console.error(`General error during cleanup for ${instanceKey}:`, error);
    }
  }

  // Report all errors at the end
  if (errors.length > 0) {
    console.log('\n=== CLEANUP ERRORS SUMMARY ===');
    errors.forEach(({ instance, error, operation }) => {
      console.log(`Instance: ${instance}`);
      console.log(`Operation: ${operation}`);
      console.log(`Error: ${error.message}`);
      if (isClerkAPIResponseError(error)) {
        console.log(`Status: ${error.status}`);
      }
      console.log('---');
    });
    console.log(`Total errors: ${errors.length}`);
  } else {
    console.log('\n✅ Cleanup completed successfully with no errors');
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
