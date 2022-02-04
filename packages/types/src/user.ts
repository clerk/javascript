import { EmailAddressResource } from './emailAddress';
import { ExternalAccountResource } from './externalAccount';
import { ImageResource } from './image';
import { UserJSON } from './json';
import { PhoneNumberResource } from './phoneNumber';
import { ClerkResource } from './resource';
import { SessionWithActivitiesResource } from './session';
import { GetUserTokenOptions,JWTService } from './token';
import { SnakeToCamel } from './utils';
import { Web3WalletResource } from './web3Wallet';

export interface UserResource extends ClerkResource {
  id: string;
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
  passwordEnabled: boolean;
  publicMetadata: Record<string, unknown>;
  unsafeMetadata: Record<string, unknown>;
  updatedAt: Date | null;
  createdAt: Date | null;

  update: (params: UpdateUserParams) => Promise<UserResource>;
  createEmailAddress: (email: string) => Promise<EmailAddressResource>;
  createPhoneNumber: (phoneNumber: string) => Promise<PhoneNumberResource>;
  twoFactorEnabled: () => boolean;
  isPrimaryIdentification: (
    ident: EmailAddressResource | PhoneNumberResource,
  ) => boolean;
  getToken: (
    service: JWTService,
    options?: GetUserTokenOptions,
  ) => Promise<string>;
  getSessions: () => Promise<SessionWithActivitiesResource[]>;
  setProfileImage: (file: Blob | File) => Promise<ImageResource>;
}

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

export type UpdateUserParams = Partial<
  SnakeToCamel<UpdateUserJSON> & UpdateUserJSON
>;
