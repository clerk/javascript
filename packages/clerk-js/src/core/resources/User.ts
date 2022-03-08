import type {
  CreateEmailAddressParams,
  CreatePhoneNumberParams,
  EmailAddressResource,
  ExternalAccountJSON,
  ExternalAccountResource,
  ImageResource,
  OAuthStrategy,
  PhoneNumberResource,
  SetProfileImageParams,
  UpdateUserParams,
  UserJSON,
  UserResource,
  Web3WalletResource,
} from '@clerk/types';
import { unixEpochToDate } from 'utils/date';
import { normalizeUnsafeMetadata } from 'utils/resourceParams';

import {
  BaseResource,
  EmailAddress,
  ExternalAccount,
  Image,
  OrganizationMembership,
  PhoneNumber,
  RetrieveMembershipsParams,
  SessionWithActivities,
  Web3Wallet,
} from './internal';

export class User extends BaseResource implements UserResource {
  pathRoot = '/me';

  id = '';
  username: string | null = null;
  emailAddresses: EmailAddressResource[] = [];
  phoneNumbers: PhoneNumberResource[] = [];
  web3Wallets: Web3WalletResource[] = [];
  externalAccounts: ExternalAccountResource[] = [];
  passwordEnabled = false;
  firstName: string | null = null;
  lastName: string | null = null;
  fullName: string | null = null;
  primaryEmailAddressId: string | null = null;
  primaryEmailAddress: EmailAddressResource | null = null;
  primaryPhoneNumberId: string | null = null;
  primaryPhoneNumber: PhoneNumberResource | null = null;
  primaryWeb3WalletId: string | null = null;
  primaryWeb3Wallet: Web3WalletResource | null = null;
  profileImageUrl = '';
  publicMetadata: Record<string, unknown> = {};
  unsafeMetadata: Record<string, unknown> = {};
  updatedAt: Date | null = null;
  createdAt: Date | null = null;

  private cachedSessionsWithActivities: SessionWithActivities[] | null = null;

  static isUserResource(resource: unknown): resource is User {
    return !!resource && resource instanceof User;
  }

  constructor(data: UserJSON) {
    super();
    this.fromJSON(data);
  }

  protected path(): string {
    return this.pathRoot;
  }

  isPrimaryIdentification = (ident: EmailAddressResource | PhoneNumberResource | Web3WalletResource): boolean => {
    switch (ident.constructor) {
      case EmailAddress:
        return this.primaryEmailAddressId === ident.id;
      case PhoneNumber:
        return this.primaryPhoneNumberId === ident.id;
      case Web3Wallet:
        return this.primaryWeb3WalletId === ident.id;
      default:
        return false;
    }
  };

  twoFactorEnabled = (): boolean => {
    let enabled = false;
    for (const ph of this.phoneNumbers) {
      if (ph.reservedForSecondFactor) {
        enabled = true;
        break;
      }
    }

    return enabled;
  };

  createEmailAddress = (params: CreateEmailAddressParams): Promise<EmailAddressResource> => {
    const { email } = params || {};
    return new EmailAddress(
      {
        email_address: email,
      },
      this.path() + '/email_addresses/',
    ).create();
  };

  createPhoneNumber = (params: CreatePhoneNumberParams): Promise<PhoneNumberResource> => {
    const { phoneNumber } = params || {};
    return new PhoneNumber(
      {
        phone_number: phoneNumber,
      },
      this.path() + '/phone_numbers/',
    ).create();
  };

  createExternalAccount = async ({
    strategy,
    redirect_url,
  }: {
    strategy: OAuthStrategy;
    redirect_url?: string;
  }): Promise<ExternalAccountResource> => {
    const json = (
      await BaseResource._fetch<ExternalAccountJSON>({
        path: '/me/external_accounts',
        method: 'POST',
        body: { strategy, redirect_url } as any,
      })
    )?.response as unknown as ExternalAccountJSON;

    return new ExternalAccount(json, this.path() + '/external_accounts');
  };

  update = (params: UpdateUserParams): Promise<UserResource> => {
    return this._basePatch({
      body: normalizeUnsafeMetadata(params),
    });
  };

  getSessions = async (): Promise<SessionWithActivities[]> => {
    if (this.cachedSessionsWithActivities) {
      return this.cachedSessionsWithActivities;
    }
    const res = await SessionWithActivities.retrieve();
    this.cachedSessionsWithActivities = res;
    return res;
  };

  setProfileImage = (params: SetProfileImageParams): Promise<ImageResource> => {
    const { file } = params || {};
    return Image.create(`${this.path()}/profile_image`, {
      file,
    });
  };

  getOrganizationMemberships = async (
    retrieveMembership: RetrieveMembershipsParams,
  ): Promise<OrganizationMembership[]> => {
    return await OrganizationMembership.retrieve(retrieveMembership);
  };

  get verifiedExternalAccounts() {
    return this.externalAccounts.filter(externalAccount => externalAccount.verification?.status == 'verified');
  }

  get unverifiedExternalAccounts() {
    return this.externalAccounts.filter(externalAccount => externalAccount.verification?.status != 'verified');
  }

  protected fromJSON(data: UserJSON): this {
    this.id = data.id;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    if (this.firstName && this.lastName) {
      this.fullName = this.firstName + ' ' + this.lastName;
    }

    this.profileImageUrl = data.profile_image_url;
    this.username = data.username;
    this.passwordEnabled = data.password_enabled;
    this.emailAddresses = data.email_addresses.map(ea => new EmailAddress(ea, this.path() + '/email_addresses'));

    this.primaryEmailAddressId = data.primary_email_address_id;
    this.primaryEmailAddress = this.emailAddresses.find(({ id }) => id === this.primaryEmailAddressId) || null;

    this.phoneNumbers = data.phone_numbers.map(ph => new PhoneNumber(ph, this.path() + '/phone_numbers'));

    this.primaryPhoneNumberId = data.primary_phone_number_id;
    this.primaryPhoneNumber = this.phoneNumbers.find(({ id }) => id === this.primaryPhoneNumberId) || null;

    this.web3Wallets = data.web3_wallets.map(ph => new Web3Wallet(ph, this.path() + '/web3_wallets'));

    this.primaryWeb3WalletId = data.primary_web3_wallet_id;
    this.primaryWeb3Wallet = this.web3Wallets.find(({ id }) => id === this.primaryWeb3WalletId) || null;

    this.externalAccounts = data.external_accounts.map(
      ea => new ExternalAccount(ea, this.path() + '/external_accounts'),
    );

    this.publicMetadata = data.public_metadata;
    this.unsafeMetadata = data.unsafe_metadata;

    this.updatedAt = unixEpochToDate(data.updated_at);
    this.createdAt = unixEpochToDate(data.created_at);
    return this;
  }
}
