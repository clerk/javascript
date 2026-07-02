import { createClerkClient } from '@clerk/backend';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import { parsePublishableKey } from '@clerk/shared/keys';
import { isStaging } from '@clerk/shared/utils';
import { test as setup } from '@playwright/test';

import { appConfigs } from '../presets/';

setup('cleanup instances ', async () => {
  const entries = Array.from(appConfigs.secrets.instanceKeys.entries())
    .map(([keyName, { pk, sk }]) => {
      const secretKey = sk;
      if (!secretKey) {
        return null;
      }
      const parsedPk = parsePublishableKey(pk);
      const apiUrl = isStaging(parsedPk.frontendApi) ? 'https://api.clerkstage.dev' : 'https://api.clerk.com';
      return {
        keyName,
        secretKey,
        apiUrl,
        instanceName: parsedPk.instanceId || parsedPk.frontendApi.split('.')[0] || 'unknown',
      };
    })
    .filter(Boolean);

  const cleanupSummary: Array<{
    keyName: string;
    instanceName: string;
    usersDeleted: number;
    orgsDeleted: number;
    errors: string[];
    status: 'success' | 'error' | 'unauthorized';
  }> = [];

  console.log('🧹 Starting E2E Test Cleanup Process...\n');

  for (const entry of entries) {
    const instanceSummary = {
      keyName: entry.keyName,
      instanceName: entry.instanceName,
      usersDeleted: 0,
      orgsDeleted: 0,
      errors: [] as string[],
      status: 'success' as 'success' | 'error' | 'unauthorized',
    };

    try {
      const clerkClient = createClerkClient({ secretKey: entry.secretKey, apiUrl: entry.apiUrl });

      // Fetch test users with broad queries, then filter strictly by test-domain
      // email or test-phone marker. The previous `clerkcookie` query missed users
      // from the older `test+clerk_test_<hash>@example.com` pattern, letting a
      // backlog accumulate indefinitely. Broadening the fetch to `clerk_test`
      // also matches some real team accounts (e.g. fredrik+debugging-clerk_test
      // @clerk.dev), so deletion is gated by a strict domain/phone whitelist.
      let users: any[] = [];
      try {
        const usersWithClerkCookie = await fetchAllUsers(clerkClient, { query: 'clerkcookie' });
        const usersWithClerkTest = await fetchAllUsers(clerkClient, { query: 'clerk_test' });
        const usersWithPhoneNumber = await fetchAllUsers(clerkClient, { query: '55501' });

        // Deduplicate users by ID
        const allUsersMap = new Map();
        [...usersWithClerkCookie, ...usersWithClerkTest, ...usersWithPhoneNumber].forEach(user => {
          allUsersMap.set(user.id, user);
        });
        users = Array.from(allUsersMap.values()).filter(isTestUser);
      } catch (error) {
        instanceSummary.errors.push(`Failed to get users: ${error.message}`);
        console.error(`Error getting users for ${entry.instanceName}:`, error);
        users = []; // Continue with empty users list
      }

      // Get organizations with error handling
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
          instanceSummary.errors.push(`Failed to get organizations: ${error.message}`);
          console.error(`Error getting organizations for ${entry.instanceName}:`, error);
          orgs = []; // Continue with empty orgs list
        }
      }

      const usersToDelete = batchElements(skipObjectsThatWereCreatedWithinTheLast10Minutes(users), 5);
      const orgsToDelete = batchElements(skipObjectsThatWereCreatedWithinTheLast10Minutes(orgs), 5);

      // Delete users with tracking
      for (const batch of usersToDelete) {
        console.log(`Starting user deletion batch...`);
        await Promise.all(
          batch.map(user => {
            console.log(
              `Cleaning up user ${user.id} (${user.emailAddresses?.[0]?.emailAddress || user.phoneNumbers?.[0]?.phoneNumber}) (${new Date(
                user.createdAt,
              ).toISOString()})`,
            );
            return clerkClient.users
              .deleteUser(user.id)
              .then(() => {
                instanceSummary.usersDeleted++;
              })
              .catch(error => {
                if (error.status !== 404) {
                  instanceSummary.errors.push(`User ${user.id}: ${error.message}`);
                  console.error(`Error deleting user ${user.id}:`, error);
                }
              });
          }),
        );
        await new Promise(r => setTimeout(r, 1000));
      }

      // Delete organizations with tracking
      for (const batch of orgsToDelete) {
        console.log(`Starting organization deletion batch...`);
        await Promise.all(
          batch.map(org => {
            console.log(`Cleaning up org ${org.id} (${org.name}) (${new Date(org.createdAt).toISOString()})`);
            return clerkClient.organizations
              .deleteOrganization(org.id)
              .then(() => {
                instanceSummary.orgsDeleted++;
              })
              .catch(error => {
                if (error.status !== 404) {
                  instanceSummary.errors.push(`Org ${org.id}: ${error.message}`);
                  console.error(`Error deleting org ${org.id}:`, error);
                }
              });
          }),
        );
        await new Promise(r => setTimeout(r, 1000));
      }

      // Report instance results
      const maskedKey = entry.secretKey.replace(/(sk_(test|live)_)(.+)(...)/, '$1***$4');
      if (instanceSummary.usersDeleted > 0 || instanceSummary.orgsDeleted > 0) {
        console.log(
          `✅ ${entry.keyName} / ${entry.instanceName} (${maskedKey}): ${instanceSummary.usersDeleted} users, ${instanceSummary.orgsDeleted} orgs deleted`,
        );
      } else {
        console.log(`✅ ${entry.keyName} / ${entry.instanceName} (${maskedKey}): clean`);
      }

      if (instanceSummary.errors.length > 0) {
        instanceSummary.status = 'error';
      }
    } catch (error) {
      const maskedKey = entry.secretKey.replace(/(sk_(test|live)_)(.+)(...)/, '$1***$4');
      if (isClerkAPIResponseError(error) && (error.status === 401 || error.status === 403)) {
        console.log(`🔒 ${entry.keyName} / ${entry.instanceName} (${maskedKey}): Unauthorized access`);
        instanceSummary.status = 'unauthorized';
      } else {
        console.log(`❌ ${entry.keyName} / ${entry.instanceName} (${maskedKey}): ${error.message}`);
        instanceSummary.errors.push(error.message);
        instanceSummary.status = 'error';
      }
    }

    cleanupSummary.push(instanceSummary);
  }

  // Final summary
  const totalUsersDeleted = cleanupSummary.reduce((sum, instance) => sum + instance.usersDeleted, 0);
  const totalOrgsDeleted = cleanupSummary.reduce((sum, instance) => sum + instance.orgsDeleted, 0);
  const errorInstances = cleanupSummary.filter(instance => instance.status === 'error').length;
  const unauthorizedInstances = cleanupSummary.filter(instance => instance.status === 'unauthorized').length;

  console.log(`\n📊 Summary: ${totalUsersDeleted} users, ${totalOrgsDeleted} orgs deleted`);
  if (errorInstances > 0 || unauthorizedInstances > 0) {
    console.log(`   ${errorInstances} errors, ${unauthorizedInstances} unauthorized`);
  }

  // Detailed error report
  const instancesWithErrors = cleanupSummary.filter(instance => instance.errors.length > 0);
  if (instancesWithErrors.length > 0) {
    console.log('\n=== DETAILED ERROR REPORT ===');
    instancesWithErrors.forEach(instance => {
      console.log(`\n${instance.keyName} / ${instance.instanceName}:`);
      instance.errors.forEach(error => console.log(`  - ${error}`));
    });
  }

  if (errorInstances === 0 && unauthorizedInstances === 0) {
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

const PAGE_SIZE = 500;
const MAX_PAGES = 50;

const TEST_EMAIL_DOMAINS = new Set(['clerkcookie.com', 'example.com', 'mailsac.com']);
const TEST_PHONE_PATTERN = /55501\d{2}$/;

function isTestUser(user: any): boolean {
  const emails: string[] = (user.emailAddresses ?? []).map((e: any) => e.emailAddress ?? '');
  for (const email of emails) {
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && TEST_EMAIL_DOMAINS.has(domain)) return true;
  }
  const phones: string[] = (user.phoneNumbers ?? []).map((p: any) => p.phoneNumber ?? '');
  if (phones.some(p => TEST_PHONE_PATTERN.test(p))) return true;
  return false;
}

async function fetchAllUsers(
  clerkClient: ReturnType<typeof createClerkClient>,
  filter: { query: string },
): Promise<any[]> {
  const collected: any[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const { data } = await clerkClient.users.getUserList({
      orderBy: '+created_at',
      query: filter.query,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    });
    collected.push(...data);
    if (data.length < PAGE_SIZE) break;
  }
  return collected;
}
