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
  password: string;
  username?: string;
  phoneNumber?: string;
  deleteIfExists: () => Promise<void>;
};

export type FakeOrganization = {
  name: string;
  organization: { id: string };
  delete: () => Promise<Organization>;
};

export type UserService = {
  createFakeUser: (options?: FakeUserOptions) => FakeUser;
  createBapiUser: (fakeUser: FakeUser) => Promise<User>;
  deleteIfExists: (opts: { id?: string; email?: string }) => Promise<void>;
  createFakeOrganization: (userId: string) => Promise<FakeOrganization>;
};

/**
 * This generates a random fictional number that can be verified using the 424242 code.
 * Allowing 10^5 combinations should be enough entropy for e2e purposes.
 * @see https://clerk.com/docs/testing/e2e-testing#phone-numbers
 */
function fakerPhoneNumber() {
  return `+1###55501##`.replace(/#+/g, m => faker.string.numeric(m.length));
}

export const createUserService = (clerkClient: ClerkClient) => {
  const self: UserService = {
    createFakeUser: (options?: FakeUserOptions) => {
      const {
        fictionalEmail = true,
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
        phoneNumber: withPhoneNumber ? fakerPhoneNumber() : undefined,
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
      let id = opts.id;

      if (!id) {
        const { data: users } = await clerkClient.users.getUserList({ emailAddress: [opts.email] });
        id = users[0]?.id;
      }

      if (!id) {
        console.log(`User "${opts.email}" does not exist!`);
        return;
      }

      await clerkClient.users.deleteUser(id);
    },
    createFakeOrganization: async userId => {
      const name = faker.animal.dog();
      const organization = await clerkClient.organizations.createOrganization({
        name: faker.animal.dog(),
        createdBy: userId,
      });
      return {
        name,
        organization,
        delete: () => clerkClient.organizations.deleteOrganization(organization.id),
      } satisfies FakeOrganization;
    },
  };

  return self;
};
