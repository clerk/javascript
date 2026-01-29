import { getFullName } from '@clerk/shared/internal/clerk-js/user';
import type {
  BackupCodeJSON,
  BackupCodeResource,
  CreateEmailAddressParams,
  CreateExternalAccountParams,
  CreatePhoneNumberParams,
  CreateWeb3WalletParams,
  DeletedObjectJSON,
  DeletedObjectResource,
  EmailAddressResource,
  EnterpriseAccountResource,
  ExternalAccountJSON,
  ExternalAccountResource,
  GetOrganizationMemberships,
  GetUserOrganizationInvitationsParams,
  GetUserOrganizationSuggestionsParams,
  ImageResource,
  OrganizationMembershipResource,
  PasskeyResource,
  PhoneNumberResource,
  RemoveUserPasswordParams,
  SetProfileImageParams,
  TOTPJSON,
  TOTPResource,
  UpdateUserParams,
  UpdateUserPasswordParams,
  UserJSON,
  UserJSONSnapshot,
  UserResource,
  VerifyTOTPParams,
  Web3WalletResource,
} from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { normalizeUnsafeMetadata } from '../../utils/resourceParams';
import { eventBus, events } from '../events';
import { addPaymentMethod, getPaymentMethods, initializePaymentMethod } from '../modules/billing';
import { BackupCode } from './BackupCode';
import {
  BaseResource,
  DeletedObject,
  EmailAddress,
  EnterpriseAccount,
  ExternalAccount,
  Image,
  OrganizationMembership,
  OrganizationSuggestion,
  Passkey,
  PhoneNumber,
  SessionWithActivities,
  TOTP,
  UserOrganizationInvitation,
  Web3Wallet,
} from './internal';
import { OrganizationCreationDefaults } from './OrganizationCreationDefaults';

export class User extends BaseResource implements UserResource {
  pathRoot = '/me';

  id = '';
  externalId: string | null = null;
  username: string | null = null;
  emailAddresses: EmailAddressResource[] = [];
  phoneNumbers: PhoneNumberResource[] = [];
  web3Wallets: Web3WalletResource[] = [];
  externalAccounts: ExternalAccountResource[] = [];
  enterpriseAccounts: EnterpriseAccountResource[] = [];
  passkeys: PasskeyResource[] = [];
  organizationMemberships: OrganizationMembershipResource[] = [];
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
  imageUrl = '';
  hasImage = false;
  twoFactorEnabled = false;
  totpEnabled = false;
  backupCodeEnabled = false;
  publicMetadata: UserPublicMetadata = {};
  unsafeMetadata: UserUnsafeMetadata = {};
  createOrganizationEnabled = false;
  createOrganizationsLimit: number | null = null;
  deleteSelfEnabled = false;
  lastSignInAt: Date | null = null;
  legalAcceptedAt: Date | null = null;
  updatedAt: Date | null = null;
  createdAt: Date | null = null;

  private cachedSessionsWithActivities: SessionWithActivities[] | null = null;

  static isUserResource(resource: unknown): resource is User {
    return !!resource && resource instanceof User;
  }

  constructor(data: UserJSON | UserJSONSnapshot | null) {
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

  createEmailAddress = (params: CreateEmailAddressParams): Promise<EmailAddressResource> => {
    const { email } = params || {};
    return new EmailAddress(
      {
        email_address: email,
      },
      this.path() + '/email_addresses/',
    ).create();
  };

  createPasskey = (): Promise<PasskeyResource> => {
    return Passkey.registerPasskey();
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

  createWeb3Wallet = (params: CreateWeb3WalletParams): Promise<Web3WalletResource> => {
    const { web3Wallet } = params || {};
    return new Web3Wallet(
      {
        web3_wallet: web3Wallet,
      },
      this.path() + '/web3_wallets/',
    ).create();
  };

  createExternalAccount = async (params: CreateExternalAccountParams): Promise<ExternalAccountResource> => {
    const { strategy, redirectUrl, additionalScopes } = params || {};

    const json = (
      await BaseResource._fetch<ExternalAccountJSON>({
        path: '/me/external_accounts',
        method: 'POST',
        body: {
          strategy,
          redirect_url: redirectUrl,
          additional_scope: additionalScopes,
        } as any,
      })
    )?.response as unknown as ExternalAccountJSON;

    return new ExternalAccount(json, this.path() + '/external_accounts');
  };

  createTOTP = async (): Promise<TOTPResource> => {
    const json = (
      await BaseResource._fetch<TOTPJSON>({
        path: '/me/totp',
        method: 'POST',
      })
    )?.response as unknown as TOTPJSON;

    return new TOTP(json);
  };

  verifyTOTP = async ({ code }: VerifyTOTPParams): Promise<TOTPResource> => {
    const json = (
      await BaseResource._fetch<ExternalAccountJSON>({
        path: '/me/totp/attempt_verification',
        method: 'POST',
        body: { code } as any,
      })
    )?.response as unknown as TOTPJSON;

    return new TOTP(json);
  };

  disableTOTP = async (): Promise<DeletedObjectResource> => {
    const json = (
      await BaseResource._fetch<DeletedObjectJSON>({
        path: '/me/totp',
        method: 'DELETE',
      })
    )?.response as unknown as DeletedObjectJSON;

    return new DeletedObject(json);
  };

  createBackupCode = async (): Promise<BackupCodeResource> => {
    const json = (
      await BaseResource._fetch<BackupCodeJSON>({
        path: this.path() + '/backup_codes/',
        method: 'POST',
      })
    )?.response as unknown as BackupCodeJSON;

    return new BackupCode(json);
  };

  update = (params: UpdateUserParams): Promise<UserResource> => {
    return this._basePatch({
      body: normalizeUnsafeMetadata(params),
    });
  };

  updatePassword = (params: UpdateUserPasswordParams): Promise<UserResource> => {
    return this._basePost({
      body: params,
      path: `${this.path()}/change_password`,
    });
  };

  removePassword = (params: RemoveUserPasswordParams): Promise<UserResource> => {
    return this._basePost({
      body: params,
      path: `${this.path()}/remove_password`,
    });
  };

  delete = (): Promise<void> => {
    return this._baseDelete({ path: '/me' }).then(res => {
      eventBus.emit(events.UserSignOut, null);
      return res;
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

    if (file === null) {
      return Image.delete(`${this.path()}/profile_image`);
    }
    return Image.create(`${this.path()}/profile_image`, {
      file,
    });
  };

  getOrganizationInvitations = (params?: GetUserOrganizationInvitationsParams) => {
    return UserOrganizationInvitation.retrieve(params);
  };

  getOrganizationSuggestions = (params?: GetUserOrganizationSuggestionsParams) => {
    return OrganizationSuggestion.retrieve(params);
  };

  getOrganizationMemberships: GetOrganizationMemberships = retrieveMembership =>
    OrganizationMembership.retrieve(retrieveMembership);

  getOrganizationCreationDefaults = () => OrganizationCreationDefaults.retrieve();

  leaveOrganization = async (organizationId: string): Promise<DeletedObjectResource> => {
    const json = (
      await BaseResource._fetch<DeletedObjectJSON>({
        path: `${this.path()}/organization_memberships/${organizationId}`,
        method: 'DELETE',
      })
    )?.response as unknown as DeletedObjectJSON;

    return new DeletedObject(json);
  };

  initializePaymentMethod: typeof initializePaymentMethod = params => {
    return initializePaymentMethod(params);
  };

  addPaymentMethod: typeof addPaymentMethod = params => {
    return addPaymentMethod(params);
  };

  getPaymentMethods: typeof getPaymentMethods = params => {
    return getPaymentMethods(params);
  };

  get verifiedExternalAccounts() {
    return this.externalAccounts.filter(externalAccount => externalAccount.verification?.status == 'verified');
  }

  get unverifiedExternalAccounts() {
    return this.externalAccounts.filter(externalAccount => externalAccount.verification?.status != 'verified');
  }

  get verifiedWeb3Wallets() {
    return this.web3Wallets.filter(web3Wallet => web3Wallet.verification?.status == 'verified');
  }

  get hasVerifiedEmailAddress() {
    return this.emailAddresses.filter(email => email.verification.status === 'verified').length > 0;
  }

  get hasVerifiedPhoneNumber() {
    return this.phoneNumbers.filter(phone => phone.verification.status === 'verified').length > 0;
  }

  protected fromJSON(data: UserJSON | UserJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.externalId = data.external_id || null;
    this.firstName = data.first_name || null;
    this.lastName = data.last_name || null;
    if (this.firstName || this.lastName) {
      this.fullName = getFullName({ firstName: this.firstName, lastName: this.lastName });
    }

    this.imageUrl = data.image_url || '';
    this.hasImage = data.has_image || false;
    this.username = data.username || null;
    this.passwordEnabled = data.password_enabled || false;
    this.emailAddresses = (data.email_addresses || []).map(
      ea => new EmailAddress(ea, this.path() + '/email_addresses'),
    );

    this.primaryEmailAddressId = data.primary_email_address_id || null;
    this.primaryEmailAddress = this.emailAddresses.find(({ id }) => id === this.primaryEmailAddressId) || null;

    this.phoneNumbers = (data.phone_numbers || []).map(ph => new PhoneNumber(ph, this.path() + '/phone_numbers'));

    this.primaryPhoneNumberId = data.primary_phone_number_id || null;
    this.primaryPhoneNumber = this.phoneNumbers.find(({ id }) => id === this.primaryPhoneNumberId) || null;

    this.web3Wallets = (data.web3_wallets || []).map(ph => new Web3Wallet(ph, this.path() + '/web3_wallets'));

    this.primaryWeb3WalletId = data.primary_web3_wallet_id || null;
    this.primaryWeb3Wallet = this.web3Wallets.find(({ id }) => id === this.primaryWeb3WalletId) || null;

    this.externalAccounts = (data.external_accounts || []).map(
      ea => new ExternalAccount(ea, this.path() + '/external_accounts'),
    );

    this.passkeys = (data.passkeys || []).map(passkey => new Passkey(passkey));

    this.organizationMemberships = (data.organization_memberships || []).map(om => new OrganizationMembership(om));

    this.enterpriseAccounts = (data.enterprise_accounts || []).map(
      ea => new EnterpriseAccount(ea, this.path() + '/enterprise_accounts'),
    );

    this.publicMetadata = data.public_metadata || {};
    this.unsafeMetadata = data.unsafe_metadata || {};

    this.totpEnabled = data.totp_enabled || false;
    this.backupCodeEnabled = data.backup_code_enabled || false;
    this.twoFactorEnabled = data.two_factor_enabled || false;

    this.createOrganizationEnabled = data.create_organization_enabled || false;
    this.createOrganizationsLimit = data.create_organizations_limit || null;
    this.deleteSelfEnabled = data.delete_self_enabled || false;

    if (data.last_sign_in_at) {
      this.lastSignInAt = unixEpochToDate(data.last_sign_in_at);
    }

    if (data.legal_accepted_at) {
      this.legalAcceptedAt = unixEpochToDate(data.legal_accepted_at);
    }

    this.updatedAt = unixEpochToDate(data.updated_at || undefined);
    this.createdAt = unixEpochToDate(data.created_at || undefined);
    return this;
  }

  public __internal_toSnapshot(): UserJSONSnapshot {
    return {
      object: 'user',
      id: this.id,
      external_id: this.externalId,
      first_name: this.firstName,
      last_name: this.lastName,
      username: this.username,
      public_metadata: this.publicMetadata,
      unsafe_metadata: this.unsafeMetadata,
      image_url: this.imageUrl,
      has_image: this.hasImage,
      email_addresses: this.emailAddresses.map(ea => ea.__internal_toSnapshot()),
      phone_numbers: this.phoneNumbers.map(ph => ph.__internal_toSnapshot()),
      web3_wallets: this.web3Wallets.map(ph => ph.__internal_toSnapshot()),
      external_accounts: this.externalAccounts.map(ea => ea.__internal_toSnapshot()),
      passkeys: this.passkeys.map(passkey => passkey.__internal_toSnapshot()),
      organization_memberships: this.organizationMemberships.map(om => om.__internal_toSnapshot()),
      enterprise_accounts: this.enterpriseAccounts.map(ea => ea.__internal_toSnapshot()),
      totp_enabled: this.totpEnabled,
      backup_code_enabled: this.backupCodeEnabled,
      two_factor_enabled: this.twoFactorEnabled,
      create_organization_enabled: this.createOrganizationEnabled,
      create_organizations_limit: this.createOrganizationsLimit,
      delete_self_enabled: this.deleteSelfEnabled,
      primary_email_address_id: this.primaryEmailAddressId,
      primary_phone_number_id: this.primaryPhoneNumberId,
      primary_web3_wallet_id: this.primaryWeb3WalletId,
      password_enabled: this.passwordEnabled,
      profile_image_id: this.imageUrl,
      last_sign_in_at: this.lastSignInAt?.getTime() || null,
      legal_accepted_at: this.legalAcceptedAt?.getTime() || null,
      updated_at: this.updatedAt?.getTime() || null,
      created_at: this.createdAt?.getTime() || null,
    };
  }
}
