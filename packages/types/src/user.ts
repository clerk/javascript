import { DeletedObjectResource } from './deletedObject';
import { EmailAddressResource } from './emailAddress';
import { ExternalAccountResource } from './externalAccount';
import { ImageResource } from './image';
import { UserJSON } from './json';
import { OrganizationMembershipResource } from './organizationMembership';
import { PhoneNumberResource } from './phoneNumber';
import { ClerkResource } from './resource';
import { SessionWithActivitiesResource } from './session';
import { OAuthStrategy } from './strategies';
import { TOTPResource } from './totp';
import { SnakeToCamel } from './utils';
import { Web3WalletResource } from './web3Wallet';

declare global {
  /**
   * If you want to provide custom types for the user.publicMetadata object,
   * simply redeclare this rule in the global namespace.
   * Every user object will use the provided type.
   */
  interface UserPublicMetadata {
    [k: string]: unknown;
  }

  /**
   * If you want to provide custom types for the user.unsafeMetadata object,
   * simply redeclare this rule in the global namespace.
   * Every user object will use the provided type.
   */
  interface UserUnsafeMetadata {
    [k: string]: unknown;
  }
}

export interface UserResource extends ClerkResource {
  id: string;
  externalId: string | null;
  primaryEmailAddressId: string | null;
  primaryEmailAddress: EmailAddressResource | null;
  primaryPhoneNumberId: string | null;
  primaryPhoneNumber: PhoneNumberResource | null;
  primaryWeb3WalletId: string | null;
  primaryWeb3Wallet: Web3WalletResource | null;
  username: string | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string;
  emailAddresses: EmailAddressResource[];
  phoneNumbers: PhoneNumberResource[];
  web3Wallets: Web3WalletResource[];
  externalAccounts: ExternalAccountResource[];
  organizationMemberships: OrganizationMembershipResource[];
  passwordEnabled: boolean;
  totpEnabled: boolean;
  twoFactorEnabled: boolean;
  publicMetadata: UserPublicMetadata;
  unsafeMetadata: UserUnsafeMetadata;
  lastSignInAt: Date | null;
  updatedAt: Date | null;
  createdAt: Date | null;

  update: (params: UpdateUserParams) => Promise<UserResource>;
  createEmailAddress: (params: CreateEmailAddressParams) => Promise<EmailAddressResource>;
  createPhoneNumber: (params: CreatePhoneNumberParams) => Promise<PhoneNumberResource>;
  createWeb3Wallet: (params: CreateWeb3WalletParams) => Promise<Web3WalletResource>;
  isPrimaryIdentification: (ident: EmailAddressResource | PhoneNumberResource | Web3WalletResource) => boolean;
  getSessions: () => Promise<SessionWithActivitiesResource[]>;
  setProfileImage: (params: SetProfileImageParams) => Promise<ImageResource>;
  createExternalAccount: ({
    strategy,
    redirect_url,
  }: {
    strategy: OAuthStrategy;
    redirect_url?: string;
  }) => Promise<ExternalAccountResource>;
  createTOTP: () => Promise<TOTPResource>;
  verifyTOTP: (params: VerifyTOTPParams) => Promise<TOTPResource>;
  disableTOTP: () => Promise<DeletedObjectResource>;
  get verifiedExternalAccounts(): ExternalAccountResource[];
  get unverifiedExternalAccounts(): ExternalAccountResource[];
  get hasVerifiedEmailAddress(): boolean;
  get hasVerifiedPhoneNumber(): boolean;
}

export type CreateEmailAddressParams = { email: string };
export type CreatePhoneNumberParams = { phoneNumber: string };
export type CreateWeb3WalletParams = { web3Wallet: string };
export type SetProfileImageParams = { file: Blob | File };
export type VerifyTOTPParams = { code: string };

type UpdateUserJSON = Pick<
  UserJSON,
  | 'username'
  | 'password'
  | 'first_name'
  | 'last_name'
  | 'primary_email_address_id'
  | 'primary_phone_number_id'
  | 'primary_web3_wallet_id'
  | 'unsafe_metadata'
>;

export type UpdateUserParams = Partial<SnakeToCamel<UpdateUserJSON>>;
