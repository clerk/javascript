import { EmailAddress } from './EmailAddress';
import { ExternalAccount } from './ExternalAccount';
import type { ExternalAccountJSON, UserJSON } from './JSON';
import { PhoneNumber } from './PhoneNumber';
import { Web3Wallet } from './Web3Wallet';

export class User {
  constructor(
    readonly id: string,
    readonly passwordEnabled: boolean,
    readonly totpEnabled: boolean,
    readonly backupCodeEnabled: boolean,
    readonly twoFactorEnabled: boolean,
    readonly banned: boolean,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly imageUrl: string,
    readonly hasImage: boolean,
    readonly gender: string,
    readonly birthday: string,
    readonly primaryEmailAddressId: string | null,
    readonly primaryPhoneNumberId: string | null,
    readonly primaryWeb3WalletId: string | null,
    readonly lastSignInAt: number | null,
    readonly externalId: string | null,
    readonly username: string | null,
    readonly firstName: string | null,
    readonly lastName: string | null,
    readonly publicMetadata: UserPublicMetadata = {},
    readonly privateMetadata: UserPrivateMetadata = {},
    readonly unsafeMetadata: UserUnsafeMetadata = {},
    readonly emailAddresses: EmailAddress[] = [],
    readonly phoneNumbers: PhoneNumber[] = [],
    readonly web3Wallets: Web3Wallet[] = [],
    readonly externalAccounts: ExternalAccount[] = [],
  ) {}

  static fromJSON(data: UserJSON): User {
    return new User(
      data.id,
      data.password_enabled,
      data.totp_enabled,
      data.backup_code_enabled,
      data.two_factor_enabled,
      data.banned,
      data.created_at,
      data.updated_at,
      data.image_url,
      data.has_image,
      data.gender,
      data.birthday,
      data.primary_email_address_id,
      data.primary_phone_number_id,
      data.primary_web3_wallet_id,
      data.last_sign_in_at,
      data.external_id,
      data.username,
      data.first_name,
      data.last_name,
      data.public_metadata,
      data.private_metadata,
      data.unsafe_metadata,
      (data.email_addresses || []).map(x => EmailAddress.fromJSON(x)),
      (data.phone_numbers || []).map(x => PhoneNumber.fromJSON(x)),
      (data.web3_wallets || []).map(x => Web3Wallet.fromJSON(x)),
      (data.external_accounts || []).map((x: ExternalAccountJSON) => ExternalAccount.fromJSON(x)),
    );
  }
}
