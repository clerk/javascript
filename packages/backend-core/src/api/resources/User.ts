import camelcaseKeys from 'camelcase-keys';

import associationDefaults from '../utils/Associations';
import filterKeys from '../utils/Filter';
import { EmailAddress } from './EmailAddress';
import { Association } from './Enums';
import { ExternalAccount } from './ExternalAccount';
import type { ExternalAccountJSON, UserJSON } from './JSON';
import { PhoneNumber } from './PhoneNumber';
import type { UserProps } from './Props';

interface UserAssociations {
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
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
    'passwordEnabled',
    'twoFactorEnabled',
    'passwordEnabled',
    'passwordEnabled',
    'passwordEnabled',
    'twoFactorEnabled',
    'publicMetadata',
    'privateMetadata',
    'createdAt',
    'updatedAt',
  ];

  static associations = {
    emailAddresses: Association.HasMany,
    phoneNumbers: Association.HasMany,
    externalAccounts: Association.HasMany,
  };

  static defaults = {
    publicMetadata: {},
    privateMetadata: {},
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

    obj.externalAccounts = (data.external_accounts || []).map(
      (x: ExternalAccountJSON) => ExternalAccount.fromJSON(x)
    );

    return new User(obj as UserPayload);
  }
}
