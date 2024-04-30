import type { ClerkClient, Organization, User } from '@clerk/backend';
import { faker } from '@faker-js/faker';

import { hash } from '../models/helpers';

type FakeUserOptions = {
  /**
   * A fictional email is an email that contains +clerk_test and can always be verified using 424242 as the OTP. No email will be sent.
   * https://clerk.com/docs/testing/test-emails-and-phones#email-addresses
   *
   * @default false
   **/
  fictionalEmail?: boolean;

  /**
   * If true, the user will have a password otherwise will be set to undefined.
   *
   * @default true
   **/
  withPassword?: boolean;

  /**
   * If true, the user will have a phone number otherwise will be set to undefined.
   *
   * @default false
   **/
  withPhoneNumber?: boolean;

  /**
   * If true, the user will have a username otherwise will be set to undefined.
   *
   * @default false
   **/
  withUsername?: boolean;
};

export type FakeUser = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  username?: string;
  phoneNumber?: string;
  deleteIfExists: () => Promise<void>;
};

export type FakeOrganization = {
  name: string;
  slug: string;
  deleteIfExists: () => Promise<void>;
};

export type UserService = {
  createFakeUser: (options?: FakeUserOptions) => FakeUser;
  createBapiUser: (fakeUser: FakeUser) => Promise<User>;
  deleteIfExists: (opts: { id?: string; email?: string }) => Promise<void>;
  deleteIfOrganizationExists: (slug: string) => Promise<void>;
  createFakeOrganization: () => FakeOrganization;
  createBapiOrganization: (fakeOrg: FakeOrganization, userId: string) => Promise<Organization>;
};

export const createUserService = (clerkClient: ClerkClient) => {
  const self: UserService = {
    createFakeUser: (options?: FakeUserOptions) => {
      const {
        fictionalEmail = false,
        withPassword = true,
        withPhoneNumber = false,
        withUsername = false,
      } = options || {};
      const randomHash = hash();
      const email = fictionalEmail
        ? `${randomHash}+clerk_test@clerkcookie.com`
        : `clerkcookie+${randomHash}@mailsac.com`;

      return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email,
        username: withUsername ? `${randomHash}_clerk_cookie` : undefined,
        password: withPassword ? `${email}${randomHash}` : undefined,
        // this generates a random fictional number that can be verified
        // using the 424242 code. Allowing 10^5 combinations should be enough
        // entropy for e2e purposes
        // https://clerk.com/docs/testing/e2e-testing#phone-numbers
        phoneNumber: withPhoneNumber ? faker.phone.number('+1###55501##') : undefined,
        deleteIfExists: () => self.deleteIfExists({ email }),
      };
    },
    createBapiUser: async fakeUser => {
      return await clerkClient.users.createUser({
        emailAddress: [fakeUser.email],
        password: fakeUser.password,
        firstName: fakeUser.firstName,
        lastName: fakeUser.lastName,
        phoneNumber: fakeUser.phoneNumber !== undefined ? [fakeUser.phoneNumber] : undefined,
        username: fakeUser.username,
        skipPasswordRequirement: fakeUser.password === undefined,
      });
    },
    deleteIfExists: async (opts: { id?: string; email?: string }) => {
      const id = opts.id || (await clerkClient.users.getUserList({ emailAddress: [opts.email] }))[0]?.id;
      if (id) {
        await clerkClient.users.deleteUser(id);
      }
    },
    deleteIfOrganizationExists: async (orgId: string) => {
      const orgExists = await clerkClient.organizations.getOrganization({
        organizationId: orgId,
      });
      if (orgExists.id) {
        await clerkClient.organizations.deleteOrganization(orgExists.id);
      }
    },
    createFakeOrganization: () => {
      const name = faker.company.name();
      const slug = faker.helpers.slugify(name);

      return {
        name,
        slug,
        deleteIfExists: () => self.deleteIfOrganizationExists(slug),
      };
    },
    createBapiOrganization: async (fakeOrg: FakeOrganization, userId: string) => {
      return await clerkClient.organizations.createOrganization({
        name: fakeOrg.name,
        createdBy: userId,
      });
    },
  };

  return self;
};
