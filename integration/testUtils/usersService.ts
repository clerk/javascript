import type { Clerk } from '@clerk/backend';
import { faker } from '@faker-js/faker';

import { hash } from '../models/helpers';

export type FakeUser = ReturnType<ReturnType<typeof createUserService>['createFakeUser']>;
export type FakeOrganization = ReturnType<ReturnType<Awaited<typeof createUserService>>['createFakeOrganization']>;

type FakeUserOptions = {
  /**
   * A fictional email is an email that contains +clerk_test and can always be verified using 424242 as the OTP. No email will be sent.
   * https://clerk.com/docs/testing/test-emails-and-phones#email-addresses
   **/
  fictionalEmail: boolean;
};

export const createUserService = (clerkClient: ReturnType<typeof Clerk>) => {
  const self = {
    createFakeUser: (options?: FakeUserOptions) => {
      const { fictionalEmail = false } = options || {};
      const email = fictionalEmail ? `${hash()}+clerk_test@example.com` : `clerkcookie+${hash()}@mailsac.com`;
      return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email,
        password: `${email}${email}`,
        // this generates a random fictional number that can be verified
        // using the 424242 code. Allowing 10^5 combinations should be enough
        // entropy for e2e purposes
        // https://clerk.com/docs/testing/e2e-testing#phone-numbers
        phoneNumber: faker.phone.number('+1###55501##'),
        deleteIfExists: () => self.deleteIfExists({ email }),
      };
    },
    createBapiUser: async (fakeUser: ReturnType<typeof self.createFakeUser>) => {
      return await clerkClient.users.createUser({
        emailAddress: [fakeUser.email],
        password: fakeUser.password,
        firstName: fakeUser.firstName,
        lastName: fakeUser.lastName,
      });
    },
    deleteIfExists: async (opts: { id?: string; email?: string }) => {
      const id = opts.id || (await clerkClient.users.getUserList({ emailAddress: [opts.email] }))[0]?.id;
      if (id) {
        await clerkClient.users.deleteUser(id);
      }
    },
    createFakeOrganization: async (userId: string) => {
      const name = faker.animal.dog();
      const organization = await clerkClient.organizations.createOrganization({
        name: faker.animal.dog(),
        createdBy: userId,
      });
      return {
        name,
        organization,
        delete: () => clerkClient.organizations.deleteOrganization(organization.id),
      };
    },
  };
  return self;
};
