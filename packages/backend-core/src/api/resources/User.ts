import camelcaseKeys from 'camelcase-keys';

import { EmailAddress } from './EmailAddress';
import { Association } from './Enums';
import { ExternalAccount } from './ExternalAccount';
import type { ExternalAccountJSON, UserJSON } from './JSON';
import { PhoneNumber } from './PhoneNumber';
import type { EmailAddressProps, ExternalAccountProps, PhoneNumberProps, Web3WalletProps } from './Props';
import { Web3Wallet } from './Web3Wallet';

export const userAssociations = {
  emailAddresses: Association.HasMany,
  phoneNumbers: Association.HasMany,
  web3Wallets: Association.HasMany,
  externalAccounts: Association.HasMany,
};

export class User {
  constructor(
    readonly id: string,
    readonly passwordEnabled: boolean,
    readonly twoFactorEnabled: boolean,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly profileImageUrl: string,
    readonly gender: string,
    readonly birthday: string,
    readonly primaryEmailAddressId: string | null,
    readonly primaryPhoneNumberId: string | null,
    readonly primaryWeb3WalletId: string | null,
    readonly lastSignInAt: string | null,
    readonly externalId: string | null,
    readonly username: string | null,
    readonly firstName: string | null,
    readonly lastName: string | null,
    readonly publicMetadata: Record<string, unknown> = {},
    readonly privateMetadata: Record<string, unknown> = {},
    readonly unsafeMetadata: Record<string, unknown> = {},
    readonly emailAddresses: EmailAddressProps[] = [],
    readonly phoneNumbers: PhoneNumberProps[] = [],
    readonly web3Wallets: Web3WalletProps[] = [],
    readonly externalAccounts: ExternalAccountProps[] = [],
  ) {}

  static fromJSON(data: UserJSON): User {
    const obj = camelcaseKeys(data) as Record<string, any>;

    obj.emailAddresses = (data.email_addresses || []).map(x => EmailAddress.fromJSON(x));
    obj.phoneNumbers = (data.phone_numbers || []).map(x => PhoneNumber.fromJSON(x));
    obj.web3Wallets = (data.web3_wallets || []).map(x => Web3Wallet.fromJSON(x));
    obj.externalAccounts = (data.external_accounts || []).map((x: ExternalAccountJSON) => ExternalAccount.fromJSON(x));

    return new User(
      obj.id,
      obj.passwordEnabled,
      obj.twoFactorEnabled,
      obj.createdAt,
      obj.updatedAt,
      obj.profileImageUrl,
      obj.gender,
      obj.birthday,
      obj.primaryEmailAddressId,
      obj.primaryPhoneNumberId,
      obj.primaryWeb3WalletId,
      obj.lastSignInAt,
      obj.externalId,
      obj.username,
      obj.firstName,
      obj.lastName,
      obj.publicMetadata,
      obj.privateMetadata,
      obj.unsafeMetadata,
      obj.emailAddresses,
      obj.phoneNumbers,
      obj.web3Wallets,
      obj.externalAccounts,
    );
  }
}
