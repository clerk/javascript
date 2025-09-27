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
      return {
        secretKey,
        apiUrl,
        instanceName: parsedPk.instanceId || parsedPk.frontendApi.split('.')[0] || 'unknown',
      };
    })
    .filter(Boolean);

  const cleanupSummary: Array<{
    instanceName: string;
    usersDeleted: number;
    orgsDeleted: number;
    errors: string[];
    status: 'success' | 'error' | 'unauthorized';
  }> = [];

  console.log('🧹 Starting E2E Test Cleanup Process...\n');

  for (const entry of entries) {
    const instanceSummary = {
      instanceName: entry.instanceName,
      usersDeleted: 0,
      orgsDeleted: 0,
      errors: [] as string[],
      status: 'success' as 'success' | 'error' | 'unauthorized',
    };

    const clerkClient = createClerkClient({ secretKey: entry.secretKey, apiUrl: entry.apiUrl });

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

      const allUsersMap = new Map();
      [...usersWithEmail, ...usersWithPhoneNumber].forEach(user => {
        allUsersMap.set(user.id, user);
      });
      const users = Array.from(allUsersMap.values());

      const { data: orgs } = await clerkClient.organizations
        .getOrganizationList({
          limit: 150,
        })
        .catch(() => ({ data: [] }));

      const usersToDelete = batchElements(skipObjectsThatWereCreatedWithinTheLast10Minutes(users), 5);
      const orgsToDelete = batchElements(skipObjectsThatWereCreatedWithinTheLast10Minutes(orgs), 5);

      for (const batch of usersToDelete) {
        await Promise.all(
          batch.map(user => {
            return clerkClient.users
              .deleteUser(user.id)
              .then(() => {
                instanceSummary.usersDeleted++;
              })
              .catch(error => {
                if (error.status !== 404) {
                  instanceSummary.errors.push(`User ${user.id}: ${error.message}`);
                }
              });
          }),
        );
        await new Promise(r => setTimeout(r, 1000));
      }

      for (const batch of orgsToDelete) {
        await Promise.all(
          batch.map(org => {
            return clerkClient.organizations
              .deleteOrganization(org.id)
              .then(() => {
                instanceSummary.orgsDeleted++;
              })
              .catch(error => {
                if (error.status !== 404) {
                  instanceSummary.errors.push(`Org ${org.id}: ${error.message}`);
                }
              });
          }),
        );
        await new Promise(r => setTimeout(r, 1000));
      }

      const maskedKey = entry.secretKey.replace(/(sk_(test|live)_)(.+)(...)/, '$1***$4');
      if (instanceSummary.usersDeleted > 0 || instanceSummary.orgsDeleted > 0) {
        console.log(
          `✅ ${entry.instanceName} (${maskedKey}): ${instanceSummary.usersDeleted} users, ${instanceSummary.orgsDeleted} orgs deleted`,
        );
      } else {
        console.log(`✅ ${entry.instanceName} (${maskedKey}): clean`);
      }
      if (instanceSummary.errors.length > 0) {
        instanceSummary.status = 'error';
      }
    } catch (error) {
      const maskedKey = entry.secretKey.replace(/(sk_(test|live)_)(.+)(...)/, '$1***$4');
      if (error.status === 401 || error.status === 403) {
        console.log(`🔒 ${entry.instanceName} (${maskedKey}): Unauthorized access`);
        instanceSummary.status = 'unauthorized';
      } else {
        console.log(`❌ ${entry.instanceName} (${maskedKey}): ${error.message}`);
        instanceSummary.errors.push(error.message);
        instanceSummary.status = 'error';
      }
    }

    cleanupSummary.push(instanceSummary);
  }

  const totalUsersDeleted = cleanupSummary.reduce((sum, instance) => sum + instance.usersDeleted, 0);
  const totalOrgsDeleted = cleanupSummary.reduce((sum, instance) => sum + instance.orgsDeleted, 0);
  const errorInstances = cleanupSummary.filter(instance => instance.status === 'error').length;
  const unauthorizedInstances = cleanupSummary.filter(instance => instance.status === 'unauthorized').length;

  console.log(`\n📊 Summary: ${totalUsersDeleted} users, ${totalOrgsDeleted} orgs deleted`);
  if (errorInstances > 0 || unauthorizedInstances > 0) {
    console.log(`   ${errorInstances} errors, ${unauthorizedInstances} unauthorized`);
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
