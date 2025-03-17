import type { ClerkClient, Organization } from '@clerk/backend';
import { faker } from '@faker-js/faker';

export type FakeOrganization = Pick<Organization, 'slug' | 'name'>;

export type OrganizationService = {
  deleteAll: () => Promise<void>;
  createFakeOrganization: () => FakeOrganization;
};

export const createOrganizationsService = (clerkClient: ClerkClient) => {
  const self: OrganizationService = {
    createFakeOrganization: () => ({
      slug: faker.helpers.slugify(faker.commerce.department()).toLowerCase(),
      name: faker.commerce.department(),
    }),
    deleteAll: async () => {
      const organizations = await clerkClient.organizations.getOrganizationList();

      const bulkDeletionPromises = organizations.data.map(({ id }) => clerkClient.organizations.deleteOrganization(id));

      await Promise.all(bulkDeletionPromises);
    },
  };

  return self;
};
