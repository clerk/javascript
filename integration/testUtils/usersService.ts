import type { APIKey, ClerkClient, Organization, User } from '@clerk/backend';
import { faker } from '@faker-js/faker';

import { hash } from '../models/helpers';

async function withErrorLogging<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    console.error(`[usersService] ${operation} failed:`);
    console.error('  Status:', e.status);
    console.error('  Message:', e.message);
    console.error('  Errors:', JSON.stringify(e.errors, null, 2));
    console.error('  Clerk Trace ID:', e.clerkTraceId);
    throw e;
  }
}

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

  /**
   * If true, the user will have an email otherwise will be set to undefined.
   *
   * @default true
   **/
  withEmail?: boolean;
};

export type FakeUser = {
  firstName: string;
  lastName: string;
  email?: string;
  password: string;
  username?: string;
  phoneNumber?: string;
  deleteIfExists: () => Promise<void>;
};

export type FakeUserWithEmail = FakeUser & { email: string };

export type FakeOrganization = {
  name: string;
  organization: { id: string };
  delete: () => Promise<Organization>;
};

export type FakeAPIKey = {
  apiKey: APIKey;
  secret: string;
  revoke: (reason?: string | null) => Promise<APIKey>;
};

export type UserService = {
  createFakeUser: (options?: FakeUserOptions) => FakeUser;
  createBapiUser: (fakeUser: FakeUser) => Promise<User>;
  /**
   * Creates a BAPI user if it doesn't exist, otherwise returns the existing user.
   */
  getOrCreateUser: (fakeUser: FakeUser) => Promise<User>;
  deleteIfExists: (opts: { id?: string; email?: string; phoneNumber?: string }) => Promise<void>;
  createFakeOrganization: (userId: string) => Promise<FakeOrganization>;
  getUser: (opts: { id?: string; email?: string }) => Promise<User | undefined>;
  createFakeAPIKey: (userId: string) => Promise<FakeAPIKey>;
  passwordCompromised: (userId: string) => Promise<void>;
};

/**
 * Temporary limited range of area codes until FAPI is updated to allow all area codes when used with a test phone number.
 */
function random9xxAreaCode() {
  const codes = [
    901, 902, 903, 904, 905, 906, 907, 908, 909, 910, 912, 913, 914, 915, 916, 917, 918, 919, 920, 925, 927, 928, 929,
    930, 931, 934, 935, 936, 937, 938, 939, 940, 941, 945, 947, 948, 949, 951, 952, 954, 956, 959, 970, 971, 972, 973,
    978, 979, 980, 984, 985, 986, 989,
  ];
  return codes[Math.floor(Math.random() * codes.length)];
}

/**
 * This generates a random fictional number that can be verified using the 424242 code.
 * @see https://clerk.com/docs/testing/e2e-testing#phone-numbers
 */
export function fakerPhoneNumber() {
  return `+1${random9xxAreaCode()}55501${faker.string.numeric(2)}`;
}

export const createUserService = (clerkClient: ClerkClient) => {
  const self: UserService = {
    createFakeUser: (options?: FakeUserOptions) => {
      const {
        fictionalEmail = true,
        withEmail = true,
        withPassword = true,
        withPhoneNumber = false,
        withUsername = false,
      } = options || {};
      const randomHash = hash();
      const email = fictionalEmail
        ? `${randomHash}+clerk_test@clerkcookie.com`
        : `clerkcookie+${randomHash}@mailsac.com`;
      const phoneNumber = fakerPhoneNumber();

      return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: withEmail ? email : undefined,
        username: withUsername ? `${randomHash}_clerk_cookie` : undefined,
        password: withPassword ? `${email}${randomHash}` : undefined,
        phoneNumber: withPhoneNumber ? phoneNumber : undefined,
        deleteIfExists: () => self.deleteIfExists({ email, phoneNumber }),
      };
    },
    createBapiUser: async fakeUser => {
      return withErrorLogging('createBapiUser', () =>
        clerkClient.users.createUser({
          emailAddress: fakeUser.email !== undefined ? [fakeUser.email] : undefined,
          password: fakeUser.password,
          firstName: fakeUser.firstName,
          lastName: fakeUser.lastName,
          phoneNumber: fakeUser.phoneNumber !== undefined ? [fakeUser.phoneNumber] : undefined,
          username: fakeUser.username,
          skipPasswordRequirement: fakeUser.password === undefined,
        }),
      );
    },
    getOrCreateUser: async fakeUser => {
      const existingUser = await self.getUser({ email: fakeUser.email });
      if (existingUser) {
        return existingUser;
      }
      return await self.createBapiUser(fakeUser);
    },
    deleteIfExists: async (opts: { id?: string; email?: string; phoneNumber?: string }) => {
      let id = opts.id;

      if (!id) {
        const { data: users } = await withErrorLogging('getUserList', () =>
          clerkClient.users.getUserList({
            emailAddress: [opts.email],
            phoneNumber: [opts.phoneNumber],
          }),
        );
        id = users[0]?.id;
      }

      if (!id) {
        console.log(`User "${opts.email || opts.phoneNumber}" does not exist!`);
        return;
      }

      await withErrorLogging('deleteUser', () => clerkClient.users.deleteUser(id));
    },
    getUser: async (opts: { id?: string; email?: string }) => {
      if (opts.id) {
        try {
          const user = await withErrorLogging('getUser', () => clerkClient.users.getUser(opts.id));
          return user;
        } catch (err) {
          console.log(`Error fetching user "${opts.id}": ${err.message}`);
          return;
        }
      }

      if (opts.email) {
        const { data: users } = await withErrorLogging('getUserList', () =>
          clerkClient.users.getUserList({ emailAddress: [opts.email] }),
        );
        if (users.length > 0) {
          return users[0];
        } else {
          console.log(`User "${opts.email}" does not exist!`);
          return;
        }
      }

      throw new Error('Either id or email must be provided');
    },
    createFakeOrganization: async userId => {
      const name = faker.animal.dog();
      const organization = await withErrorLogging('createOrganization', () =>
        clerkClient.organizations.createOrganization({
          name: faker.animal.dog(),
          createdBy: userId,
        }),
      );
      return {
        name,
        organization,
        delete: () =>
          withErrorLogging('deleteOrganization', () => clerkClient.organizations.deleteOrganization(organization.id)),
      } satisfies FakeOrganization;
    },
    createFakeAPIKey: async (userId: string) => {
      const TWENTY_MINUTES = 20 * 60;

      const apiKey = await withErrorLogging('createAPIKey', () =>
        clerkClient.apiKeys.create({
          subject: userId,
          name: `Integration Test - ${faker.string.uuid()}`,
          secondsUntilExpiration: TWENTY_MINUTES,
        }),
      );

      return {
        apiKey,
        secret: apiKey.secret ?? '',
        revoke: (reason?: string | null) =>
          clerkClient.apiKeys.revoke({ apiKeyId: apiKey.id, revocationReason: reason }),
      } satisfies FakeAPIKey;
    },
    passwordCompromised: async (userId: string) => {
      await withErrorLogging('passwordCompromised', () => clerkClient.users.__experimental_passwordCompromised(userId));
    },
  };

  return self;
};
