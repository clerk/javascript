import type {
  EmailAddressResource,
  PhoneNumberResource,
  SessionResource,
  SignInResource,
  SignUpResource,
  UserResource,
} from '@clerk/types';

/**
 * Generates mock data for Clerk resources using realistic defaults
 * and allowing for easy customization through overrides.
 */
export class ClerkMockDataGenerator {
  static createUser(overrides?: Partial<UserResource>): UserResource {
    return {
      id: 'user_2NNEqL3jKm1lQxVKZ5gXyZ',
      object: 'user',
      externalId: null,
      primaryEmailAddressId: 'email_2NNEqL3jKm1lQxVKZ5gXyZ',
      primaryEmailAddress: this.createEmailAddress(),
      primaryPhoneNumberId: null,
      primaryPhoneNumber: null,
      primaryWeb3WalletId: null,
      primaryWeb3Wallet: null,
      username: 'testuser',
      fullName: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      imageUrl: 'https://img.clerk.com/profile.jpg',
      hasImage: true,
      emailAddresses: [this.createEmailAddress()],
      phoneNumbers: [],
      web3Wallets: [],
      externalAccounts: [],
      enterpriseAccounts: [],
      passkeys: [],
      samlAccounts: [],
      organizationMemberships: [],
      passwordEnabled: true,
      totpEnabled: false,
      backupCodeEnabled: false,
      twoFactorEnabled: false,
      publicMetadata: {},
      unsafeMetadata: {},
      lastSignInAt: new Date(),
      legalAcceptedAt: null,
      createOrganizationEnabled: true,
      createOrganizationsLimit: null,
      deleteSelfEnabled: true,
      updatedAt: new Date(),
      createdAt: new Date(),
      // Mock methods - these would be properly implemented in real usage
      update: async () => this.createUser(),
      delete: async () => {},
      updatePassword: async () => this.createUser(),
      removePassword: async () => this.createUser(),
      createEmailAddress: async () => this.createEmailAddress(),
      createPasskey: async () => ({}) as any,
      createPhoneNumber: async () => this.createPhoneNumber(),
      createWeb3Wallet: async () => ({}) as any,
      isPrimaryIdentification: () => true,
      getSessions: async () => [],
      setProfileImage: async () => ({}) as any,
      createExternalAccount: async () => ({}) as any,
      getOrganizationMemberships: async () => ({}) as any,
      getOrganizationInvitations: async () => ({}) as any,
      getOrganizationSuggestions: async () => ({}) as any,
      leaveOrganization: async () => ({}) as any,
      createTOTP: async () => ({}) as any,
      verifyTOTP: async () => ({}) as any,
      disableTOTP: async () => ({}) as any,
      createBackupCode: async () => ({}) as any,
      get verifiedExternalAccounts() {
        return [];
      },
      get unverifiedExternalAccounts() {
        return [];
      },
      get verifiedWeb3Wallets() {
        return [];
      },
      get hasVerifiedEmailAddress() {
        return true;
      },
      get hasVerifiedPhoneNumber() {
        return false;
      },
      __internal_toSnapshot: () => ({}) as any,
      ...overrides,
    } as UserResource;
  }

  static createEmailAddress(overrides?: Partial<EmailAddressResource>): EmailAddressResource {
    return {
      id: 'email_2NNEqL3jKm1lQxVKZ5gXyZ',
      object: 'email_address',
      emailAddress: 'john.doe@example.com',
      verification: {
        status: 'verified',
        strategy: 'email_code',
        attempts: null,
        expireAt: null,
      },
      linkedTo: [],
      ...overrides,
    } as EmailAddressResource;
  }

  static createPhoneNumber(overrides?: Partial<PhoneNumberResource>): PhoneNumberResource {
    return {
      id: 'phone_2NNEqL3jKm1lQxVKZ5gXyZ',
      object: 'phone_number',
      phoneNumber: '+1234567890',
      verification: {
        status: 'verified',
        strategy: 'phone_code',
        attempts: null,
        expireAt: null,
      },
      linkedTo: [],
      ...overrides,
    } as PhoneNumberResource;
  }

  static createSession(overrides?: Partial<SessionResource>): SessionResource {
    return {
      id: 'sess_2NNEqL3jKm1lQxVKZ5gXyZ',
      object: 'session',
      status: 'active',
      expireAt: new Date(Date.now() + 86400000),
      abandonAt: new Date(Date.now() + 86400000),
      factorVerificationAge: null,
      lastActiveToken: null,
      lastActiveOrganizationId: null,
      lastActiveAt: new Date(),
      actor: null,
      tasks: null,
      currentTask: undefined,
      user: this.createUser(),
      publicUserData: {
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'https://img.clerk.com/profile.jpg',
        hasImage: true,
        identifier: 'john.doe@example.com',
        userId: 'user_2NNEqL3jKm1lQxVKZ5gXyZ',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      // Mock methods
      end: async () => this.createSession(),
      remove: async () => this.createSession(),
      touch: async () => this.createSession(),
      getToken: async () => 'mock-token',
      checkAuthorization: () => true,
      clearCache: () => {},
      startVerification: async () => ({}) as any,
      prepareFirstFactorVerification: async () => ({}) as any,
      attemptFirstFactorVerification: async () => ({}) as any,
      prepareSecondFactorVerification: async () => ({}) as any,
      attemptSecondFactorVerification: async () => ({}) as any,
      verifyWithPasskey: async () => ({}) as any,
      __internal_toSnapshot: () => ({}) as any,
      ...overrides,
    } as SessionResource;
  }

  static createSignInAttempt(overrides?: Partial<SignInResource>): SignInResource {
    return {
      id: 'sign_in_2NNEqL3jKm1lQxVKZ5gXyZ',
      object: 'sign_in',
      status: 'needs_identifier',
      supportedIdentifiers: ['email_address', 'phone_number', 'username'],
      supportedFirstFactors: [
        {
          strategy: 'password',
          emailAddressId: null,
          phoneNumberId: null,
          web3WalletId: null,
          safeIdentifier: null,
        },
        {
          strategy: 'oauth_google',
          emailAddressId: null,
          phoneNumberId: null,
          web3WalletId: null,
          safeIdentifier: null,
        },
      ],
      supportedSecondFactors: null,
      firstFactorVerification: null,
      secondFactorVerification: null,
      identifier: null,
      userData: null,
      createdSessionId: null,
      // Mock methods
      create: async () => this.createSignInAttempt(),
      resetPassword: async () => this.createSignInAttempt(),
      prepareFirstFactor: async () => this.createSignInAttempt(),
      attemptFirstFactor: async () => this.createSignInAttempt(),
      prepareSecondFactor: async () => this.createSignInAttempt(),
      attemptSecondFactor: async () => this.createSignInAttempt(),
      authenticateWithRedirect: async () => {},
      authenticateWithPopup: async () => {},
      authenticateWithWeb3: async () => this.createSignInAttempt(),
      authenticateWithMetamask: async () => this.createSignInAttempt(),
      authenticateWithCoinbaseWallet: async () => this.createSignInAttempt(),
      authenticateWithOKXWallet: async () => this.createSignInAttempt(),
      authenticateWithBase: async () => this.createSignInAttempt(),
      authenticateWithPasskey: async () => this.createSignInAttempt(),
      createEmailLinkFlow: () => ({}) as any,
      validatePassword: () => {},
      __internal_toSnapshot: () => ({}) as any,
      __internal_future: {} as any,
      ...overrides,
    } as SignInResource;
  }

  static createSignUpAttempt(overrides?: Partial<SignUpResource>): SignUpResource {
    return {
      id: 'sign_up_2NNEqL3jKm1lQxVKZ5gXyZ',
      object: 'sign_up',
      status: 'missing_requirements',
      requiredFields: ['email_address', 'password'],
      optionalFields: ['first_name', 'last_name'],
      missingFields: ['email_address', 'password'],
      unverifiedFields: [],
      verifications: {},
      username: null,
      firstName: null,
      lastName: null,
      emailAddress: null,
      phoneNumber: null,
      web3Wallet: null,
      externalAccount: null,
      hasPassword: false,
      createdSessionId: null,
      createdUserId: null,
      // Mock methods
      create: async () => this.createSignUpAttempt(),
      update: async () => this.createSignUpAttempt(),
      prepareEmailAddressVerification: async () => this.createSignUpAttempt(),
      attemptEmailAddressVerification: async () => this.createSignUpAttempt(),
      preparePhoneNumberVerification: async () => this.createSignUpAttempt(),
      attemptPhoneNumberVerification: async () => this.createSignUpAttempt(),
      prepareWeb3WalletVerification: async () => this.createSignUpAttempt(),
      attemptWeb3WalletVerification: async () => this.createSignUpAttempt(),
      createEmailLinkFlow: () => ({}) as any,
      authenticateWithRedirect: async () => {},
      authenticateWithPopup: async () => {},
      authenticateWithWeb3: async () => this.createSignUpAttempt(),
      authenticateWithMetamask: async () => this.createSignUpAttempt(),
      authenticateWithCoinbaseWallet: async () => this.createSignUpAttempt(),
      authenticateWithOKXWallet: async () => this.createSignUpAttempt(),
      authenticateWithBase: async () => this.createSignUpAttempt(),
      authenticateWithPasskey: async () => this.createSignUpAttempt(),
      validatePassword: () => {},
      __internal_toSnapshot: () => ({}) as any,
      __internal_future: {} as any,
      ...overrides,
    } as SignUpResource;
  }
}
