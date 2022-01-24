import camelcaseKeys from 'camelcase-keys';

import associationDefaults from '../utils/Associations';
import filterKeys from '../utils/Filter';
import { EmailAddress } from './EmailAddress';
import { Association } from './Enums';
import { ExternalAccount } from './ExternalAccount';
import type { ExternalAccountJSON, UserJSON } from './JSON';
import { PhoneNumber } from './PhoneNumber';
import type { UserProps } from './Props';
import { Web3Wallet } from './Web3Wallet';

interface UserAssociations {
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  web3Wallets: Web3Wallet[];
  externalAccounts: ExternalAccount[];
}

interface UserPayload extends UserProps, UserAssociations {}

export interface User extends UserPayload {}

export class User {
  static attributes = [
    'id',
    'username',
    'firstName',
    'lastName',
    'gender',
    'birthday',
    'profileImageUrl',
    'primaryEmailAddressId',
    'primaryEmailAddressId',
    'primaryPhoneNumberId',
    'primaryWeb3WalletId',
    'passwordEnabled',
    'twoFactorEnabled',
    'passwordEnabled',
    'passwordEnabled',
    'passwordEnabled',
    'twoFactorEnabled',
    'publicMetadata',
    'privateMetadata',
    'unsafeMetadata',
    'createdAt',
    'updatedAt',
  ];

  static associations = {
    emailAddresses: Association.HasMany,
    phoneNumbers: Association.HasMany,
    web3Wallets: Association.HasMany,
    externalAccounts: Association.HasMany,
  };

  static defaults = {
    publicMetadata: {},
    privateMetadata: {},
    unsafeMetadata: {},
    ...associationDefaults(User.associations),
  };

  constructor(data: Partial<UserPayload> = {}) {
    Object.assign(this, User.defaults, data);
  }

  static fromJSON(data: UserJSON): User {
    const obj: Record<string, any> = {};

    const camelcased = camelcaseKeys(data);
    const filtered = filterKeys(camelcased, User.attributes);
    Object.assign(obj, filtered);

    obj.emailAddresses = (data.email_addresses || []).map((x) =>
      EmailAddress.fromJSON(x)
    );
    obj.phoneNumbers = (data.phone_numbers || []).map((x) =>
      PhoneNumber.fromJSON(x)
    );
    obj.web3Wallets = (data.web3_wallets || []).map((x) =>
      Web3Wallet.fromJSON(x)
    );
    obj.externalAccounts = (data.external_accounts || []).map(
      (x: ExternalAccountJSON) => ExternalAccount.fromJSON(x)
    );

    return new User(obj as UserPayload);
  }
}
