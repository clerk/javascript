import type { ClerkClient, Organization } from '@clerk/backend';
import { faker } from '@faker-js/faker';

export type FakeOrganization = Pick<Organization, 'slug' | 'name'>;

export type OrganizationService = {
  deleteAll: () => Promise<void>;
  createFakeOrganization: () => FakeOrganization;
  createBapiOrganization: (fakeOrganization: FakeOrganization & { createdBy: string }) => Promise<Organization>;
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
    createBapiOrganization: async (fakeOrganization: FakeOrganization & { createdBy: string }) => {
      const organization = await clerkClient.organizations.createOrganization({
        name: fakeOrganization.name,
        slug: fakeOrganization.slug,
        createdBy: fakeOrganization.createdBy,
      });
      return organization;
    },
  };

  return self;
};
