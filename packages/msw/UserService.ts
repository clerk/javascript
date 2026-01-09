import type {
  EmailAddressResource,
  ExternalAccountResource,
  PhoneNumberResource,
  UserResource,
  Web3WalletResource,
} from '@clerk/shared/types';

function generateJWT(userId: string, sessionId: string, organizationId?: string | null): string {
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload: Record<string, any> = {
    azp: 'https://example.com',
    exp: Math.floor(Date.now() / 1000) + 86400 * 7,
    iat: Math.floor(Date.now() / 1000),
    iss: 'https://clerk.example.com',
    nbf: Math.floor(Date.now() / 1000),
    sid: sessionId,
    sub: userId,
  };

  if (organizationId) {
    payload.org_id = organizationId;
    payload.org_role = 'org:admin';
    payload.org_slug = 'acme-inc';
  }

  const signature = 'mock-signature';

  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));
  const base64Signature = btoa(signature);

  return `${base64Header}.${base64Payload}.${base64Signature}`;
}

export class UserService {
  static generateJWT = generateJWT;

  static createEmailAddress(overrides: Partial<EmailAddressResource> = {}): EmailAddressResource {
    return {
      createdAt: new Date(),
      emailAddress: 'example@personal.com',
      id: 'email_default',
      linkedTo: [],
      matchesSsoConnection: false,
      object: 'email_address',
      reserved: false,
      updatedAt: new Date(),
      verification: {
        attempts: null,
        expireAt: null,
        status: 'verified',
        strategy: 'ticket',
      },
      create: async () => ({}) as any,
      destroy: async () => ({}) as any,
      prepareVerification: async () => ({}) as any,
      attemptVerification: async () => ({}) as any,
      toString: () => 'example@personal.com',
      __internal_toSnapshot: () => ({}) as any,
      ...overrides,
    } as unknown as EmailAddressResource;
  }

  static createPhoneNumber(overrides: Partial<PhoneNumberResource> = {}): PhoneNumberResource {
    return {
      backupCodes: null,
      createdAt: new Date(),
      defaultSecondFactor: true,
      id: 'phone_default',
      linkedTo: [],
      object: 'phone_number',
      phoneNumber: '+1 (555) 123-4567',
      reserved: false,
      reservedForSecondFactor: true,
      updatedAt: new Date(),
      verification: {
        attempts: 1,
        expireAt: new Date(Date.now() + 600000),
        status: 'verified',
        strategy: 'phone_code',
      },
      destroy: async () => ({}) as any,
      prepareVerification: async () => ({}) as any,
      attemptVerification: async () => ({}) as any,
      setReservedForSecondFactor: async () => ({}) as any,
      toString: () => '+1 (555) 123-4567',
      __internal_toSnapshot: () => ({}) as any,
      ...overrides,
    } as unknown as PhoneNumberResource;
  }

  static createWeb3Wallet(overrides: Partial<Web3WalletResource> = {}): Web3WalletResource {
    const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
    return {
      createdAt: new Date(),
      id: 'web3_default',
      object: 'web3_wallet',
      updatedAt: new Date(),
      verification: {
        attempts: 1,
        expireAt: new Date(Date.now() + 600000),
        status: 'verified',
        strategy: 'web3_base_signature',
      },
      web3Wallet: walletAddress,
      destroy: async () => ({}) as any,
      prepareVerification: async () => ({}) as any,
      attemptVerification: async () => ({}) as any,
      toString: () => walletAddress,
      __internal_toSnapshot: () => ({}) as any,
      ...overrides,
    } as unknown as Web3WalletResource;
  }

  static createExternalAccount(overrides: Partial<ExternalAccountResource> = {}): ExternalAccountResource {
    return {
      approvedScopes:
        'email https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid profile',
      avatarUrl: 'https://lh3.googleusercontent.com/a/default-avatar',
      createdAt: new Date(),
      emailAddress: 'example@gmail.com',
      firstName: 'Example',
      id: 'eac_default',
      identification: null,
      imageUrl: 'https://lh3.googleusercontent.com/a/default-avatar',
      label: null,
      lastName: 'User',
      object: 'external_account',
      phoneNumber: '',
      provider: 'google',
      providerUserId: '104039773050285634152',
      publicMetadata: {},
      updatedAt: new Date(),
      username: '',
      verification: {
        attempts: null,
        expireAt: new Date(Date.now() + 600000),
        status: 'verified',
        strategy: 'oauth_google',
      },
      destroy: async () => ({}) as any,
      reauthorize: async () => ({}) as any,
      __internal_toSnapshot: () => ({}) as any,
      ...overrides,
    } as unknown as ExternalAccountResource;
  }

  static createSession(
    userId: string,
    overrides: {
      browserName?: string;
      browserVersion?: string;
      deviceType?: string;
      id?: string;
      ipAddress?: string;
      city?: string;
      country?: string;
      lastActiveAt?: Date;
      isMobile?: boolean;
    } = {},
  ) {
    const browserName = overrides.browserName || 'Chrome';
    const browserVersion = overrides.browserVersion || '138.0.0.0';
    const deviceType = overrides.deviceType || 'Macintosh';
    const city = overrides.city || 'San Francisco';
    const country = overrides.country || 'US';
    const ipAddress = overrides.ipAddress || '192.168.1.1';
    const lastActiveAt = overrides.lastActiveAt || new Date();
    const isMobile = overrides.isMobile ?? false;
    const sessionId = overrides.id || 'sess_default';
    const createdAt = new Date(Date.now() - 86400000 * 7);

    return {
      abandonAt: new Date(Date.now() + 86400000 * 30),
      actor: null,
      createdAt,
      expireAt: new Date(Date.now() + 86400000 * 7),
      factorVerificationAge: [0, 0],
      id: sessionId,
      lastActiveAt,
      lastActiveOrganizationId: null,
      lastActiveToken: null,
      latestActivity: {
        browserName,
        browserVersion,
        city,
        country,
        deviceType,
        id: `sess_activity_${sessionId.replace('sess_', '')}`,
        ipAddress,
        isMobile,
        object: 'session_activity',
      },
      object: 'session',
      publicUserData: null,
      status: 'active',
      updatedAt: lastActiveAt,
      user: null,
      revoke: async () => ({}) as any,
      __internal_toSnapshot: () => ({}) as any,
    };
  }

  static create(): UserResource {
    const emailAddress = this.createEmailAddress({
      emailAddress: 'example@personal.com',
      id: 'email_cameron_walker',
      linkedTo: [
        {
          id: 'eac_gmail',
          type: 'oauth_google',
          pathRoot: '',
          reload: async () => ({}) as any,
          __internal_toSnapshot: () => ({}) as any,
        },
      ] as any,
    });

    const phoneNumber = this.createPhoneNumber({
      id: 'phone_cameron_walker',
      phoneNumber: '+1 (555) 123-4567',
    });

    const web3Wallet = this.createWeb3Wallet({
      id: 'web3_cameron_walker',
    });

    const gmailAccount = this.createExternalAccount({
      emailAddress: 'example@gmail.com',
      firstName: 'Cameron',
      id: 'eac_gmail',
      lastName: 'Walker',
      provider: 'google',
    });

    const emailAddresses = [emailAddress];
    const phoneNumbers = [phoneNumber];
    const web3Wallets = [web3Wallet];
    const externalAccounts = [gmailAccount];

    const user = {
      backupCodeEnabled: true,
      createOrganizationEnabled: true,
      createOrganizationsLimit: null,
      createdAt: new Date(),
      deleteSelfEnabled: true,
      emailAddresses,
      enterpriseAccounts: [],
      externalAccounts,
      externalId: null,
      firstName: 'Cameron',
      fullName: 'Cameron Walker',
      hasImage: true,
      id: 'user_cameron_walker',
      imageUrl: 'https://storage.googleapis.com/images.clerk.dev/examples/previews/cameron-walker.jpg',
      lastSignInAt: new Date(),
      lastName: 'Walker',
      legalAcceptedAt: null,
      organizationMemberships: [],
      passkeys: [],
      passwordEnabled: true,
      phoneNumbers,
      primaryEmailAddress: emailAddress,
      primaryEmailAddressId: emailAddress.id,
      primaryPhoneNumber: phoneNumber,
      primaryPhoneNumberId: phoneNumber.id,
      primaryWeb3Wallet: web3Wallet,
      primaryWeb3WalletId: null,
      publicMetadata: {},
      samlAccounts: [],
      totpEnabled: true,
      twoFactorEnabled: true,
      unsafeMetadata: {},
      updatedAt: new Date(),
      username: 'cameron.walker',
      web3Wallets,
      createBackupCode: async () => ({}) as any,
      createEmailAddress: async () => emailAddress,
      createExternalAccount: async () => ({}) as any,
      createPasskey: async () => ({}) as any,
      createPhoneNumber: async () => ({}) as any,
      createTOTP: async () => ({}) as any,
      createWeb3Wallet: async () => ({}) as any,
      delete: async () => {},
      disableTOTP: async () => ({}) as any,
      get hasVerifiedEmailAddress() {
        return true;
      },
      get hasVerifiedPhoneNumber() {
        return true;
      },
      getOrganizationInvitations: async () => ({}) as any,
      getOrganizationMemberships: async () => ({}) as any,
      getOrganizationSuggestions: async () => ({}) as any,
      getSessions: async () => {
        const userId = 'user_cameron_walker';
        return [
          UserService.createSession(userId, {
            browserName: 'Chrome',
            browserVersion: '141.0.0.0',
            city: 'San Francisco',
            country: 'US',
            deviceType: 'Macintosh',
            id: 'sess_33YZ4JArIb5zfRsQDqbkeDZ2xqm',
            ipAddress: '66.41.122.192',
            isMobile: false,
            lastActiveAt: new Date(),
          }),
          UserService.createSession(userId, {
            browserName: 'Safari',
            browserVersion: '18.6',
            city: 'New York',
            country: 'US',
            deviceType: 'iPhone',
            id: 'sess_313hqP3D2wEaq3GBzMfZkbUIYgG',
            ipAddress: '2a09:bac5:91dd:2d2::48:9e',
            isMobile: true,
            lastActiveAt: new Date(Date.now() - 3600000 * 5),
          }),
          UserService.createSession(userId, {
            browserName: 'Chrome',
            browserVersion: '140.0.0.0',
            city: 'Austin',
            country: 'US',
            deviceType: 'Macintosh',
            id: 'sess_33TMapWAvoSd1LkK29QfGAgU1mh',
            ipAddress: '2601:447:cd7e:3750:cca4:37a5:97ab:784f',
            isMobile: false,
            lastActiveAt: new Date(Date.now() - 86400000 * 2),
          }),
        ] as any;
      },
      isPrimaryIdentification: () => true,
      leaveOrganization: async () => ({}) as any,
      removePassword: async () => user,
      setProfileImage: async () => ({}) as any,
      get unverifiedExternalAccounts() {
        return [];
      },
      update: async () => user,
      updatePassword: async () => user,
      get verifiedExternalAccounts() {
        return externalAccounts.filter(
          (account: ExternalAccountResource) => account.verification?.status === 'verified',
        );
      },
      get verifiedWeb3Wallets() {
        return web3Wallets.filter((wallet: Web3WalletResource) => wallet.verification?.status === 'verified');
      },
      verifyTOTP: async () => ({}) as any,
      __internal_toSnapshot: () => ({}) as any,
    } as unknown as UserResource;

    return user;
  }

  static updateUser(user: UserResource, updates: Record<string, any>): UserResource {
    if (updates.first_name !== undefined) {
      user.firstName = updates.first_name;
    }
    if (updates.last_name !== undefined) {
      user.lastName = updates.last_name;
    }
    if (updates.first_name !== undefined || updates.last_name !== undefined) {
      user.fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    if (updates.username !== undefined) {
      user.username = updates.username;
    }
    if (updates.profile_image_url !== undefined || updates.profileImageUrl !== undefined) {
      user.imageUrl = updates.profile_image_url || updates.profileImageUrl;
    }
    if (updates.primary_email_address_id !== undefined) {
      const email = user.emailAddresses.find(e => e.id === updates.primary_email_address_id);
      if (email) {
        user.primaryEmailAddress = email;
        user.primaryEmailAddressId = email.id;
      }
    }
    if (updates.primary_phone_number_id !== undefined) {
      const phone = user.phoneNumbers.find(p => p.id === updates.primary_phone_number_id);
      if (phone) {
        user.primaryPhoneNumber = phone;
        user.primaryPhoneNumberId = phone.id;
      }
    }
    if (updates.primary_web3_wallet_id !== undefined) {
      const wallet = user.web3Wallets.find(w => w.id === updates.primary_web3_wallet_id);
      if (wallet) {
        user.primaryWeb3Wallet = wallet;
        user.primaryWeb3WalletId = wallet.id;
      }
    }
    if (updates.public_metadata !== undefined) {
      try {
        user.publicMetadata =
          typeof updates.public_metadata === 'string' ? JSON.parse(updates.public_metadata) : updates.public_metadata;
      } catch (e) {
        // Ignore parse errors
      }
    }
    if (updates.unsafe_metadata !== undefined) {
      try {
        user.unsafeMetadata =
          typeof updates.unsafe_metadata === 'string' ? JSON.parse(updates.unsafe_metadata) : updates.unsafe_metadata;
      } catch (e) {
        // Ignore parse errors
      }
    }

    return user;
  }

  static addEmailAddress(user: UserResource, emailAddress: string): EmailAddressResource {
    const newEmail = this.createEmailAddress({
      emailAddress,
      id: `email_${Math.random().toString(36).substring(2, 15)}`,
      verification: {
        attempts: 0,
        expireAt: new Date(Date.now() + 600000),
        status: 'unverified',
        strategy: 'email_code',
      } as any,
    });

    user.emailAddresses.push(newEmail);

    return newEmail;
  }

  static addPhoneNumber(user: UserResource, phoneNumber: string): PhoneNumberResource {
    const newPhone = this.createPhoneNumber({
      id: `phone_${Math.random().toString(36).substring(2, 15)}`,
      phoneNumber,
      verification: {
        attempts: 0,
        expireAt: new Date(Date.now() + 600000),
        status: 'unverified',
        strategy: 'phone_code',
      } as any,
    });

    user.phoneNumbers.push(newPhone);

    return newPhone;
  }

  static prepareEmailVerification(user: UserResource, emailId: string): EmailAddressResource | null {
    const email = user.emailAddresses.find(e => e.id === emailId);
    if (!email) {
      return null;
    }

    email.verification = {
      attempts: (email.verification?.attempts || 0) + 1,
      expireAt: new Date(Date.now() + 600000),
      status: 'unverified',
      strategy: 'email_code',
    } as any;

    return email;
  }

  static preparePhoneVerification(user: UserResource, phoneId: string): PhoneNumberResource | null {
    const phone = user.phoneNumbers.find(p => p.id === phoneId);
    if (!phone) {
      return null;
    }

    phone.verification = {
      attempts: (phone.verification?.attempts || 0) + 1,
      expireAt: new Date(Date.now() + 600000),
      status: 'unverified',
      strategy: 'phone_code',
    } as any;

    return phone;
  }

  static verifyEmailAddress(user: UserResource, emailId: string): EmailAddressResource | null {
    const email = user.emailAddresses.find(e => e.id === emailId);
    if (!email) {
      return null;
    }

    email.verification = {
      attempts: null,
      expireAt: null,
      status: 'verified',
      strategy: 'email_code',
    } as any;

    return email;
  }

  static addExternalAccount(user: UserResource, strategy: string = 'oauth_google'): ExternalAccountResource {
    const provider = strategy.replace('oauth_', '');
    const externalAccountId = `eac_${Math.random().toString(36).substring(2, 15)}`;

    const newExternalAccount = this.createExternalAccount({
      emailAddress: `example@${provider === 'google' ? 'gmail' : provider}.com`,
      firstName: user.firstName || 'Example',
      id: externalAccountId,
      lastName: user.lastName || 'User',
      provider: provider as any,
    });

    user.externalAccounts.push(newExternalAccount);

    const matchingEmail = user.emailAddresses.find(email => email.emailAddress === newExternalAccount.emailAddress);

    if (matchingEmail && matchingEmail.linkedTo) {
      matchingEmail.linkedTo.push({
        id: externalAccountId,
        pathRoot: '',
        type: strategy,
        reload: async () => ({}) as any,
        __internal_toSnapshot: () => ({}) as any,
      } as any);
    }

    return newExternalAccount;
  }

  static removeExternalAccount(user: UserResource, externalAccountId: string): boolean {
    const index = user.externalAccounts.findIndex(ea => ea.id === externalAccountId);
    if (index === -1) {
      return false;
    }

    user.externalAccounts.splice(index, 1);

    const linkedEmail = user.emailAddresses.find(
      email => email.linkedTo && email.linkedTo.some((link: any) => link.id === externalAccountId),
    );
    if (linkedEmail) {
      linkedEmail.linkedTo = linkedEmail.linkedTo.filter((link: any) => link.id !== externalAccountId);
    }

    return true;
  }

  static removePhoneNumber(user: UserResource, phoneId: string): boolean {
    const index = user.phoneNumbers.findIndex(p => p.id === phoneId);
    if (index === -1) {
      return false;
    }

    const removedPhone = user.phoneNumbers[index];
    user.phoneNumbers.splice(index, 1);

    if (user.primaryPhoneNumberId === phoneId) {
      user.primaryPhoneNumber = user.phoneNumbers[0] ?? null;
      user.primaryPhoneNumberId = user.primaryPhoneNumber?.id ?? null;
    }

    return true;
  }

  static disableTOTP(user: UserResource): void {
    user.totpEnabled = false;
    user.twoFactorEnabled = !user.totpEnabled && user.backupCodeEnabled === false;
  }

  static generateBackupCodes(user: UserResource): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    user.backupCodeEnabled = true;
    return codes;
  }

  static updatePhoneNumber(
    user: UserResource,
    phoneId: string,
    updates: Record<string, any>,
  ): PhoneNumberResource | null {
    const phone = user.phoneNumbers.find(p => p.id === phoneId);
    if (!phone) {
      return null;
    }

    if (updates.reserved_for_second_factor !== undefined) {
      phone.reservedForSecondFactor =
        updates.reserved_for_second_factor === 'true' || updates.reserved_for_second_factor === true;
    }
    if (updates.default_second_factor !== undefined) {
      phone.defaultSecondFactor = updates.default_second_factor === 'true' || updates.default_second_factor === true;
    }

    return phone;
  }

  static verifyPhoneNumber(user: UserResource, phoneId: string): PhoneNumberResource | null {
    const phone = user.phoneNumbers.find(p => p.id === phoneId);
    if (!phone) {
      return null;
    }

    phone.verification = {
      attempts: null,
      expireAt: null,
      status: 'verified',
      strategy: 'phone_code',
    } as any;

    return phone;
  }
}
