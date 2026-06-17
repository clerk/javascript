import type { ClerkPaginationRequest, OAuthProvider, OrganizationInvitationStatus } from '@clerk/shared/types';

import { runtime } from '../../runtime';
import { joinPaths } from '../../util/path';
import { deprecated } from '../../util/shared';
import type {
  DeletedObject,
  EmailAddress,
  OauthAccessToken,
  OrganizationInvitation,
  OrganizationMembership,
  PhoneNumber,
  User,
} from '../resources';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import { AbstractAPI } from './AbstractApi';
import type { WithSign } from './util-types';

const basePath = '/users';

/** @generateWithEmptyComment */
export type UserCountParams = {
  /** Counts users with emails that match the given query, via case-insensitive partial match. For example, `emailAddress=hello` will match a user with the email `HELLO@example.com`. Accepts up to 100 email addresses. */
  emailAddress?: string[];
  /** Counts users with phone numbers that match the given query, via case-insensitive partial match. For example, `phoneNumber=555` will match a user with the phone number `+1555xxxxxxx`. Accepts up to 100 phone numbers. */
  phoneNumber?: string[];
  /** Counts users with usernames that match the given query, via case-insensitive partial match. For example, `username=CoolUser` will match a user with the username `SomeCoolUser`. Accepts up to 100 usernames. */
  username?: string[];
  /** Counts users with Web3 wallet addresses that match the given query, via case-insensitive partial match. For example, `web3Wallet=0x1234567890` will match a user with the Web3 wallet address `0x1234567890`. Accepts up to 100 Web3 wallet addresses. */
  web3Wallet?: string[];
  /** Counts users matching the given query across email addresses, phone numbers, usernames, Web3 wallet addresses, user IDs, first names, and last names. Partial matches supported. For example, `query=hello` will match a user with the email `HELLO@example.com`. */
  query?: string;
  /** Counts users with the specified user IDs. Accepts up to 100 user IDs. */
  userId?: string[];
  /** Counts users with the specified external IDs. Accepts up to 100 external IDs. */
  externalId?: string[];
};

/** @generateWithEmptyComment */
export type UserListParams = ClerkPaginationRequest<{
  /** Filters users with the specified email addresses. Accepts up to 100 email addresses. */
  emailAddress?: string[];
  /** Filters users with the specified phone numbers. Accepts up to 100 phone numbers. */
  phoneNumber?: string[];
  /** Filters users with the specified usernames. Accepts up to 100 usernames. */
  username?: string[];
  /** Filters users with the specified Web3 wallet addresses. Accepts up to 100 Web3 wallet addresses. */
  web3Wallet?: string[];
  /** Filters users matching the given query across email addresses, phone numbers, usernames, Web3 wallet addresses, user IDs, first names, and last names. Partial matches supported. */
  query?: string;
  /** Filters users with the specified user IDs. Accepts up to 100 user IDs. */
  userId?: string[];
  /** Filters users with the specified external IDs. Accepts up to 100 external IDs. */
  externalId?: string[];
  /** Filters users in a particular order. Prefix a value with `+` to sort in ascending order, or `-` to sort in descending order. Defaults to `-created_at`.*/
  orderBy?: WithSign<
    | 'created_at'
    | 'updated_at'
    | 'email_address'
    | 'web3wallet'
    | 'first_name'
    | 'last_name'
    | 'phone_number'
    | 'username'
    | 'last_active_at'
    | 'last_sign_in_at'
  >;
  /**
   * @deprecated Use `lastActiveAtAfter` instead. This parameter will be removed in a future version.
   */
  last_active_at_since?: number;
  /** Filters users who were last active before the given date (with millisecond precision). */
  lastActiveAtBefore?: number;
  /** Filters users who were last active after the given date (with millisecond precision). */
  lastActiveAtAfter?: number;
  /** Filters users who were created before the given date (with millisecond precision). */
  createdAtBefore?: number;
  /** Filters users who were created after the given date (with millisecond precision). */
  createdAtAfter?: number;
  /** Filters users who were last signed in after the given date (with millisecond precision). */
  lastSignInAtAfter?: number;
  /** Filters users who were last signed in before the given date (with millisecond precision). */
  lastSignInAtBefore?: number;
  /** Filters users who are members of the specified Organizations. Accepts up to 100 Organization IDs. */
  organizationId?: string[];
}>;

/** @inline */
export type UserMetadataParams = {
  /** Metadata that can be read from the Frontend API and [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }} and can be set only from the Backend API. */
  publicMetadata?: UserPublicMetadata;
  /** Metadata that can be read and set only from the [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}. */
  privateMetadata?: UserPrivateMetadata;
  /** Metadata that can be read and set from the Frontend API. It's considered unsafe because it can be modified from the Frontend API. */
  unsafeMetadata?: UserUnsafeMetadata;
};

/** @inline */
export type PasswordHasher =
  | 'argon2i'
  | 'argon2id'
  | 'awscognito'
  | 'bcrypt'
  | 'bcrypt_sha256_django'
  | 'md5'
  | 'pbkdf2_sha256'
  | 'pbkdf2_sha256_django'
  | 'pbkdf2_sha1'
  | 'phpass'
  | 'scrypt_firebase'
  | 'scrypt_werkzeug'
  | 'sha256'
  | 'md5_phpass'
  | 'ldap_ssha';

/** @inline */
export type UserPasswordHashingParams = {
  /** In case you already have the password digests and not the passwords, you can use them for the newly created user via this property. The digests should be generated with one of the supported algorithms. The hashing algorithm can be specified using the `password_hasher` property. */
  passwordDigest: string;
  /**
   * The hashing algorithm that was used to generate the password digest. Must be one of the supported algorithms. For password hashers considered insecure (currently, `md5`, `md5_salted`, `sha256`, `sha256_salted`, `sha512_symfony`), the corresponding user password hashes will be transparently migrated to `bcrypt` (a secure hasher) upon the user's first successful password sign in. Insecure schemes are marked with `(insecure)` in the list below.
   *
   * <ul>
   *  <li>`awscognito`</li>
   *   <ul>
   *    <li>When set, `password_digest` must be in the format of `awscognito#<userpoolid>#<clientid>#<identifier>`.</li>
   *     <li> Upon a successful migration, `password_hasher` will be updated to `bcrypt`, and `password_digest` will be updated to a `bcrypt` hash. </li>
   *    <li> See the [migration guide](/docs/guides/development/migrating/cognito) for usage details. </li>
   *   </ul>
   *  <li> [`bcrypt`](https://en.wikipedia.org/wiki/Bcrypt) </li>
   *   <ul>
   *    <li> When set, `password_digest` must be in the format of `$<algorithm version>$<cost>$<salt & hash>`. </li>
   *   </ul>
   *  <li> [`bcrypt_sha256_django`](https://docs.djangoproject.com/en/4.0/topics/auth/passwords/) </li>
   *   <ul>
   *    <li> This is the Django-specific variant of Bcrypt, using SHA256 hashing function. When set, `password_digest` must be in the format of (as exported from Django): `bcrypt_sha256$$<algorithm version>$<cost>$<salt & hash>`. </li>
   *   </ul>
   *  <li> [`bcrypt_peppered`](https://github.com/heartcombo/devise) </li>
   *   <ul>
   *    <li> Used in implementations such as Devise for Ruby on Rails applications. Identical to `bcrypt` except that a `pepper` string is appended to the input before hashing. When set, `password_digest` must be in the format of `$<algorithm version>$<cost>$<salt & hash>$<pepper>`. </li>
   *   </ul>
   *  <li> [`md5` (insecure)](https://en.wikipedia.org/wiki/MD5) </li>
   *   <ul>
   *    <li> When set, `password_digest` must be in the format of `5f4dcc3b5aa765d61d8327deb882cf99`. </li>
   *   </ul>
   *  <li> [`md5_salted` (insecure)](https://en.wikipedia.org/wiki/MD5) </li>
   *   <ul>
   *    <li> When set, `password_digest` must be in the format of `salt$hash`. </li>
   *    <li> _salt:_ The salt used to generate the above hash. </li>
   *    <li> _hash:_ A 32-length hex string. </li>
   *   </ul>
   *  <li> [`pbkdf2_sha1`](https://en.wikipedia.org/wiki/PBKDF2) </li>
   *   <ul>
   *    <li> When set, `password_digest` must be in the format of `pbkdf2_sha1$<iterations>$<salt>$<hash-as-hex-string>` or `pbkdf2_sha1$<iterations>$<salt-as-hex-string>$<hash-as-hex-string>$<key-length>`. </li>
   *    <li> Accepts the salt as a hex-encoded string. If the salt is not a valid hex string, the raw bytes will be used instead. Accepts the hash as a hex-encoded string. Optionally accepts the key length as the last parameter (defaults to 32). </li>
   *   </ul>
   *  <li> [`pbkdf2_sha256`](https://en.wikipedia.org/wiki/PBKDF2) </li>
   *   <ul>
   *    <li> This is the PBKDF2 algorithm using the SHA256 hashing function. When set, `password_digest` must be in the format of `pbkdf2_sha256$<iterations>$<salt>$<hash>`. </li>
   *    <li> Both the salt and the hash are expected to be base64-encoded. </li>
   *   </ul>
   *  <li> [`pbkdf2_sha512`](https://en.wikipedia.org/wiki/PBKDF2) </li>
   *   <ul>
   *    <li> This is the PBKDF2 algorithm using the SHA512 hashing function. When set, `password_digest` must be in the format of `pbkdf2_sha512$<iterations>$<salt>$<hash>`. </li>
   *    <li> The salt is expected to be an unencoded string literal, and the hash should be hex-encoded. </li>
   *   </ul>
   *  <li> [`pbkdf2_sha512_hex`](https://en.wikipedia.org/wiki/PBKDF2) </li>
   *   <ul>
   *    <li> This is the PBKDF2 algorithm using the SHA512 hashing function. When set, `password_digest` must be in the format of `pbkdf2_sha512_hex$<iterations>$<salt>$<hash>`. </li>
   *    <li> Both the salt and the hash are expected to be hex-encoded. </li>
   *   </ul>
   *  <li> [`pbkdf2_sha256_django`](https://docs.djangoproject.com/en/4.0/topics/auth/passwords/) </li>
   *   <ul>
   *    <li> This is the Django-specific variant of PBKDF2. When set, `password_digest` must be in the format of (as exported from Django): `pbkdf2_sha256$<iterations>$<salt>$<hash>`. </li>
   *    <li> The salt is expected to be un-encoded, the hash is expected base64-encoded. </li>
   *   </ul>
   *  <li> [`phpass`](https://www.openwall.com/phpass/) </li>
   *   <ul>
   *    <li> Portable public domain password hashing framework for use in PHP applications. When set, `password_digest` must be in the format of `$P$<rounds><salt><encoded-checksum>`. </li>
   *    <li> `$P$` is the prefix used to identify `phpass` hashes. </li>
   *    <li> _rounds:_ A single character encoding a 6-bit integer representing the number of rounds used. </li>
   *    <li> _salt:_ Eight characters drawn from `[./0-9A-Za-z]`, providing a 48-bit salt. </li>
   *    <li> _encoded-checksum:_ 22 characters drawn from the same set, encoding the 128-bit checksum with MD5. </li>
   *   </ul>
   *  <li> [`scrypt_firebase`](https://firebaseopensource.com/projects/firebase/scrypt/) </li>
   *   <ul>
   *    <li> The Firebase-specific variant of scrypt. When set, `password_digest` must be in the format of `<hash>$<salt>$<signer key>$<salt separator>$<rounds>$<memory cost>`. </li>
   *    <li> _hash:_ The actual Base64 hash. This can be retrieved when exporting the user from Firebase. </li>
   *    <li> _salt:_ The salt used to generate the above hash. Again, this is given when exporting the user from Firebase. </li>
   *    <li> _signer key:_ The base64 encoded signer key. </li>
   *    <li> _salt separator:_ The base64 encoded salt separator. </li>
   *    <li> _rounds:_ The number of rounds the algorithm needs to run. </li>
   *    <li> _memory cost:_ The cost of the algorithm run. </li>
   *   </ul>
   *  <li> [`scrypt_werkzeug`](https://werkzeug.palletsprojects.com/en/3.0.x/utils/#werkzeug.security.generate_password_hash) </li>
   *   <ul>
   *    <li> The Werkzeug-specific variant of scrypt. When set, `password_digest` must be in the format of `$<algorithm args>$<salt>$<hash>`. </li>
   *    <li> _algorithm args:_ The algorithm used to generate the hash. </li>
   *    <li> _salt:_ The salt used to generate the above hash. </li>
   *    <li> _hash:_ The actual Base64 hash. </li>
   *   </ul>
   *  <li> [`sha256` (insecure)](https://en.wikipedia.org/wiki/SHA-2) </li>
   *   <ul>
   *    <li> When set, `password_digest` must be a 64-length hex string. For example: `9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08`. </li>
   *   </ul>
   *  <li> [`sha256_salted` (insecure)](https://en.wikipedia.org/wiki/SHA-2) </li>
   *   <ul>
   *    <li> When set, `password_digest` must be in the format of `salt$hash`. </li>
   *    <li> _salt:_ The salt used to generate the above hash. </li>
   *    <li> _hash:_ A 64-length hex string. </li>
   *   </ul>
   *  <li> [`argon2`](https://argon2.online/) variants: `argon2i` and `argon2id`. </li>
   *   <ul>
   *    <li> Parts are demarcated by the `$` character, with the first part identifying the algorithm variant The middle part is a comma-separated list of the encoding options (memory, iterations, parallelism). The final part is the actual digest. </li>
   *    <li> When set, `password_digest` must be in the format of `$argon2i$v=19$m=4096,t=3,p=1$4t6CL3P7YiHBtwESXawI8Hm20zJj4cs7/4/G3c187e0$m7RQFczcKr5bIR0IIxbpO2P0tyrLjf3eUW3M3QSwnLc`. </li>
   *    <li> For the argon2id case, the value of the algorithm in the first part of the digest is `argon2id`: `$argon2id$v=19$m=64,t=4,p=8$Z2liZXJyaXNo$iGXEpMBTDYQ8G/71tF0qGjxRHEmR3gpGULcE93zUJVU`. </li>
   *   </ul>
   *  <li> [`sha512_symfony` (insecure)](https://symfony.com/doc/current/security/passwords.html) </li>
   *   <ul>
   *    <li> The legacy Symfony `MessageDigestPasswordEncoder` algorithm. We currently only support the SHA512 variant. When set, `password_digest` must be in the format of `sha512_symfony$iterations$salt$hash`. </li>
   *    <li> _iterations:_ A number greater than 0. </li>
   *    <li> _salt:_ The salt used to generate the above hash. </li>
   *    <li> _hash:_ The actual Base64 hash. </li>
   *   </ul>
   *  </ul>
   *
   * If you need support for any particular hashing algorithm, [contact support](https://clerk.com/contact/support).
   */
  passwordHasher: PasswordHasher;
};

/** @generateWithEmptyComment */
export type CreateUserParams = {
  /** The ID of the user as used in your external systems or your previous authentication solution. Must be unique across your instance. */
  externalId?: string;
  /** The email address(es) to assign to the user. Must be unique across your instance. The first email address will be set as the users primary email address. */
  emailAddress?: string[];
  /** The phone number(s) to assign to the user. Must be unique across your instance. The first phone number will be set as the users primary phone number. */
  phoneNumber?: string[];
  /** The username to assign to the user. Must be unique across your instance. */
  username?: string;
  /** The plaintext password to give the user. Must be at least 8 characters long, and can't be in any list of hacked passwords. */
  password?: string;
  /** The first name to assign to the user. */
  firstName?: string;
  /** The last name to assign to the user. */
  lastName?: string;
  /** The locale of the user in BCP-47 format (e.g. `'en-US'`, `'fr-FR'`). */
  locale?: string;
  /** When set to `true`, all password checks are skipped. It is recommended to use this method only when migrating plaintext passwords to Clerk. Upon migration the user base should be prompted to pick stronger password. */
  skipPasswordChecks?: boolean;
  /** When set to `true`, password is not required anymore when creating the user and can be omitted. This is useful when you are trying to create a user that doesn't have a password, in an instance that is using passwords. **You cannot use this flag if password is the only way for a user to sign into your instance.** */
  skipPasswordRequirement?: boolean;
  /** When set to `true`, all legal checks are skipped. It is not recommended to skip legal checks unless you are migrating a user to Clerk. */
  skipLegalChecks?: boolean;
  /** A custom timestamp denoting when the user accepted legal requirements, specified in RFC3339 format (e.g. `'2012-10-20T07:15:20.902Z'`). */
  legalAcceptedAt?: Date;
  /**
   * If TOTP is enabled on the instance, you can provide the secret to enable it on the newly created user without the need to reset it. Currently, the supported options are:
   * <ul>
   *  <li>Period: 30 seconds</li>
   *  <li>Code length: 6 digits</li>
   *  <li>Algorithm: SHA1</li>
   * </ul>
   */
  totpSecret?: string;
  /** If backup codes are enabled on the instance, you can provide them to enable it on the newly created user without the need to reset them. You must provide the backup codes in plain format or the corresponding bcrypt digest. */
  backupCodes?: string[];
  /** A custom timestamp denoting when the user signed up to the application, specified in RFC3339 format (e.g. `'2012-10-20T07:15:20.902Z'`). */
  createdAt?: Date;
  /** When set to `true`, the user is created already banned and cannot sign in. */
  banned?: boolean;
  /** When set to `true`, the user is created already locked. Requires the [user lockout feature](https://clerk.com/docs/guides/secure/user-lockout#lock-a-user-programmatically) to be enabled on the instance. */
  locked?: boolean;
} & UserMetadataParams &
  (UserPasswordHashingParams | object);

/** @inline */
export type UpdateUserParams = {
  /** The first name to assign to the user. */
  firstName?: string;
  /** The last name to assign to the user. */
  lastName?: string;
  /** The username to assign to the user. Must be unique across your instance. */
  username?: string;
  /** The plaintext password to assign to the user. Must be at least 8 characters long, and can not be in any list of hacked passwords. */
  password?: string;
  /** When set to `true`, all password checks are skipped. It is recommended to use this method only when migrating plaintext passwords to Clerk. Upon migration the user base should be prompted to pick stronger password. */
  skipPasswordChecks?: boolean;
  /** When set to `true`, the user is signed out from all their active sessions once their password is updated. */
  signOutOfOtherSessions?: boolean;
  /** The ID of the email address to set as primary. Must be verified and present on the given user. */
  primaryEmailAddressID?: string;
  /** When set to `true`, the user is notified that their primary email address has changed. */
  notifyPrimaryEmailAddressChanged?: boolean;
  /** The ID of the phone number to set as primary. Must be verified and present on the given user. */
  primaryPhoneNumberID?: string;
  /** The ID of the web3 wallets to set as primary. Must be verified and present on the given user. */
  primaryWeb3WalletID?: string;
  /** The ID of the image to set as the user's profile image. */
  profileImageID?: string;
  /**
   * In case TOTP is configured on the instance, you can provide the secret to enable it on the specific user without the need to reset it. Currently, the supported options are:
   * <ul>
   *  <li> Period: 30 seconds </li>
   *  <li> Code length: 6 digits </li>
   *  <li> Algorithm: SHA1 </li>
   * </ul>
   */
  totpSecret?: string;
  /** If backup codes are configured on the instance, you can provide them to enable it on the specific user without the need to reset them. You must provide the backup codes in plain format or the corresponding bcrypt digest. */
  backupCodes?: string[];
  /** The ID of the user as used in your external systems or your previous authentication solution. Must be unique across your entire instance. */
  externalId?: string;
  /** A custom timestamp denoting when the user signed up to the application, specified in RFC3339 format (e.g. `'2012-10-20T07:15:20.902Z'`). */
  createdAt?: Date;
  /** When set to `true`, all legal checks are skipped. It is not recommended to skip legal checks unless you are migrating a user to Clerk. */
  skipLegalChecks?: boolean;
  /** A custom timestamp denoting when the user accepted legal requirements, specified in RFC3339 format (e.g. `'2012-10-20T07:15:20.902Z'`). */
  legalAcceptedAt?: Date;
  /** The locale of the user in BCP-47 format (e.g. `'en-US'`). */
  locale?: string;
  /** If `true`, the user can delete themselves with the Frontend API. */
  deleteSelfEnabled?: boolean;
  /** If `true`, the user can create Organizations with the Frontend API. */
  createOrganizationEnabled?: boolean;
  /** The maximum number of Organizations the user can create. `0` means unlimited. */
  createOrganizationsLimit?: number;
  /**
   * Metadata visible to your Frontend and Backend APIs.
   *
   * @deprecated Updating metadata via `updateUser()` is deprecated. Use
   * [`updateUserMetadata()`](https://clerk.com/docs/reference/backend/user/update-user-metadata) for partial updates (deep merge) or
   * [`replaceUserMetadata()`](https://clerk.com/docs/reference/backend/user/replace-user-metadata) for full replacement.
   */
  publicMetadata?: UserPublicMetadata;
  /**
   * Metadata visible only to your Backend API.
   *
   * @deprecated Updating metadata via `updateUser()` is deprecated. Use
   * [`updateUserMetadata()`](https://clerk.com/docs/reference/backend/user/update-user-metadata) for partial updates (deep merge) or
   * [`replaceUserMetadata()`](https://clerk.com/docs/reference/backend/user/replace-user-metadata) for full replacement.
   */
  privateMetadata?: UserPrivateMetadata;
  /**
   * Metadata writeable from both the Frontend and Backend APIs.
   *
   * @deprecated Updating metadata via `updateUser()` is deprecated. Use
   * [`updateUserMetadata()`](https://clerk.com/docs/reference/backend/user/update-user-metadata) for partial updates (deep merge) or
   * [`replaceUserMetadata()`](https://clerk.com/docs/reference/backend/user/replace-user-metadata) for full replacement.
   */
  unsafeMetadata?: UserUnsafeMetadata;
} & (UserPasswordHashingParams | object);

/** @generateWithEmptyComment */
export type GetOrganizationMembershipListParams = ClerkPaginationRequest<{
  /** The ID of the user to get the list of Organization memberships for. */
  userId: string;
}>;

/** @generateWithEmptyComment */
export type GetOrganizationInvitationListParams = ClerkPaginationRequest<{
  /** The ID of the user to get the list of Organization invitations for. */
  userId: string;
  /** Filters the invitations by the provided status. */
  status?: OrganizationInvitationStatus;
}>;

/** @generateWithEmptyComment */
export type VerifyPasswordParams = {
  /** The ID of the user to verify the password for. */
  userId: string;
  /** The password to verify. */
  password: string;
};

/** @generateWithEmptyComment */
export type VerifyTOTPParams = {
  /** The ID of the user to verify the TOTP for. */
  userId: string;
  /** The TOTP or backup code to verify. */
  code: string;
};

/** @generateWithEmptyComment */
export type DeleteUserPasskeyParams = {
  /** The ID of the user to delete the passkey for. */
  userId: string;
  /** The ID of the passkey identification to delete. */
  passkeyIdentificationId: string;
};

/** @generateWithEmptyComment */
export type DeleteWeb3WalletParams = {
  /** The ID of the user to delete the Web3 wallet for. */
  userId: string;
  /** The ID of the Web3 wallet identification to delete. */
  web3WalletIdentificationId: string;
};

/** @generateWithEmptyComment */
export type DeleteUserExternalAccountParams = {
  /** The ID of the user to delete the external account for. */
  userId: string;
  /** The ID of the external account to delete. */
  externalAccountId: string;
};

/** @inline */
export type SetPasswordCompromisedParams = {
  /** Whether to revoke all sessions of the user. Defaults to `false`. */
  revokeAllSessions?: boolean;
};

export type ReplaceUserEmailAddressParams = {
  /** The new email address. Must adhere to the RFC 5322 specification for email address format. */
  emailAddress: string;
};

export type ReplaceUserPhoneNumberParams = {
  /** The new phone number. Must adhere to the E.164 standard for phone number format. */
  phoneNumber: string;
};

type UserID = {
  userId: string;
};

/** @generateWithEmptyComment */
export class UserAPI extends AbstractAPI {
  /**
   * Retrieves the list of users in your instance.
   * @returns A [PaginatedResourceResponse](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property than contains an array of [`User`](https://clerk.com/docs/reference/backend/types/backend-user) objects, and a `totalCount` property that indicates the total number of users in your instance.
   */
  public async getUserList(params: UserListParams = {}) {
    const { limit, offset, orderBy, ...userCountParams } = params;
    // TODO(dimkl): Temporary change to populate totalCount using a 2nd BAPI call to /users/count endpoint
    // until we update the /users endpoint to be paginated in a next BAPI version.
    // In some edge cases the data.length != totalCount due to a creation of a user between the 2 api responses
    const [data, totalCount] = await Promise.all([
      this.request<User[]>({
        method: 'GET',
        path: basePath,
        queryParams: params,
      }),
      this.getCount(userCountParams),
    ]);
    return { data, totalCount } as PaginatedResourceResponse<User[]>;
  }

  /**
   * Gets a [`User`](https://clerk.com/docs/reference/backend/types/backend-user) for the specified user ID.
   * @param userId - The ID of the user to retrieve.
   */
  public async getUser(userId: string) {
    this.requireId(userId);
    return this.request<User>({
      method: 'GET',
      path: joinPaths(basePath, userId),
    });
  }

  /**
   * Creates a [`User`](https://clerk.com/docs/reference/backend/types/backend-user) in your instance.
   *
   * Your settings in the [Clerk Dashboard](https://dashboard.clerk.com) determine how you should setup your user model. Anything **Required** will need to be provided when creating a user. Trying to add a field that isn't enabled will result in an error.
   *
   * Any email address and phone number created using this method will be automatically verified.
   *
   * > [!CAUTION]
   * >
   * > This endpoint is [rate limited](/docs/guides/how-clerk-works/system-limits). For development instances, a rate limit rule of **100 requests per 10 seconds** is applied.
   * > For production instances, that limit goes up to **1000 requests per 10 seconds**.
   */
  public async createUser(params: CreateUserParams) {
    return this.request<User>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  /** Updates the given [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   * @param userId - The ID of the user to update.
   * @param params - The user attributes to update.
   */
  public async updateUser(userId: string, params: UpdateUserParams = {}) {
    this.requireId(userId);

    const { publicMetadata, privateMetadata, unsafeMetadata, ...rest } = params as UpdateUserParams &
      UserMetadataParams;
    const hasMetadata = publicMetadata !== undefined || privateMetadata !== undefined || unsafeMetadata !== undefined;
    const hasRest = Object.keys(rest).length > 0;

    if (hasMetadata) {
      deprecated(
        'updateUser(userId, { publicMetadata | privateMetadata | unsafeMetadata })',
        'Use updateUserMetadata for partial updates (merge) or replaceUserMetadata for full replacement.',
      );
    }

    if (!hasMetadata) {
      return this.request<User>({
        method: 'PATCH',
        path: joinPaths(basePath, userId),
        bodyParams: rest,
      });
    }

    if (hasRest) {
      await this.request<User>({
        method: 'PATCH',
        path: joinPaths(basePath, userId),
        bodyParams: rest,
      });
    }

    return this.request<User>({
      method: 'PUT',
      path: joinPaths(basePath, userId, 'metadata'),
      bodyParams: { publicMetadata, privateMetadata, unsafeMetadata },
    });
  }

  public async replaceUserEmailAddress(userId: string, params: ReplaceUserEmailAddressParams) {
    this.requireId(userId);

    return this.request<EmailAddress>({
      method: 'PUT',
      path: joinPaths(basePath, userId, 'email_address'),
      bodyParams: params,
    });
  }

  public async replaceUserPhoneNumber(userId: string, params: ReplaceUserPhoneNumberParams) {
    this.requireId(userId);

    return this.request<PhoneNumber>({
      method: 'PUT',
      path: joinPaths(basePath, userId, 'phone_number'),
      bodyParams: params,
    });
  }

  /**
   * Updates the profile image for the given user. To remove the profile image, see [`deleteUserProfileImage()`](https://clerk.com/docs/reference/backend/user/delete-user-profile-image).
   * @param userId - The ID of the user to update the profile image for.
   * @param params - The file to set as the user's profile image.
   * @returns The updated [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   */
  public async updateUserProfileImage(userId: string, params: { file: Blob | File }) {
    this.requireId(userId);

    const formData = new runtime.FormData();
    formData.append('file', params?.file);

    return this.request<User>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'profile_image'),
      formData,
    });
  }

  /**
   * Updates the metadata for the given user, by merging existing values with the provided parameters.
   *
   * A "deep" merge will be performed - "deep" means that any nested JSON objects will be merged as well. You can remove metadata keys at any level by setting their value to `null`.
   *
   * > [!TIP]
   * > If you want to fully replace the existing metadata instead of merging, use [`replaceUserMetadata()`](/docs/reference/backend/user/replace-user-metadata).
   * @param userId - The ID of the user to update.
   * @param params - The metadata to update.
   * @returns The updated [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   */
  public async updateUserMetadata(userId: string, params: UserMetadataParams) {
    this.requireId(userId);

    return this.request<User>({
      method: 'PATCH',
      path: joinPaths(basePath, userId, 'metadata'),
      bodyParams: params,
    });
  }

  /**
   * Replaces the metadata associated with the specified user. Unlike [`updateUserMetadata()`](/docs/reference/backend/user/update-user-metadata), which deep-merges into the existing metadata, this method uses replace semantics: when a metadata field is provided, its previous value is overwritten in full with no merging at any level.
   *
   * The distinction is at two layers:
   * - **Top-level field omission preserves the existing value.** Each top-level field (`publicMetadata`, `privateMetadata`, `unsafeMetadata`) is handled independently. If you don't include a field in the request, the stored value for that field is left untouched.
   * - **The value inside a provided field is replaced in full.** When you do include a field, its previous content is discarded — any nested keys present before but absent in the new value are dropped. There is no merge.
   *
   * For the provided field, you can also send:
   * - `{}` (empty object) to clear the field.
   * - `null` to overwrite the field with a JSON `null` value. Prefer `{}` unless you specifically need a stored `null`.
   * @param userId - The ID of the user to replace the metadata for.
   * @param params - The metadata to replace.
   * @returns The updated [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   */
  public async replaceUserMetadata(userId: string, params: UserMetadataParams) {
    this.requireId(userId);

    return this.request<User>({
      method: 'PUT',
      path: joinPaths(basePath, userId, 'metadata'),
      bodyParams: params,
    });
  }

  /**
   * Deletes the given [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   * @param userId - The ID of the user to delete.
   */
  public async deleteUser(userId: string) {
    this.requireId(userId);
    return this.request<User>({
      method: 'DELETE',
      path: joinPaths(basePath, userId),
    });
  }

  /**
   * Gets the total number of users in your instance.
   */
  public async getCount(params: UserCountParams = {}) {
    return this.request<number>({
      method: 'GET',
      path: joinPaths(basePath, 'count'),
      queryParams: params,
    });
  }

  /** @deprecated Use `getUserOauthAccessToken` without the `oauth_` provider prefix . */
  public async getUserOauthAccessToken(
    userId: string,
    provider: `oauth_${OAuthProvider}`,
  ): Promise<PaginatedResourceResponse<OauthAccessToken[]>>;
  public async getUserOauthAccessToken(
    userId: string,
    provider: OAuthProvider,
  ): Promise<PaginatedResourceResponse<OauthAccessToken[]>>;
  /**
   * Gets the corresponding [OAuth access token](!oauth-access-token) for a user that has previously authenticated with the given OAuth provider.
   * @param userId - The ID of the user to get the OAuth access tokens for.
   * @param provider - The OAuth provider to get the access tokens for. If using a custom OAuth provider, prefix the provider name with `custom_` (e.g. `custom_google`).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property than contains an array of [`OauthAccessToken`](https://clerk.com/docs/reference/backend/types/backend-oauth-access-token) objects, and a `totalCount` property that indicates the total number of OAuth access tokens for the specified user and provider.
   */
  public async getUserOauthAccessToken(userId: string, provider: `oauth_${OAuthProvider}` | OAuthProvider) {
    this.requireId(userId);
    const hasPrefix = provider.startsWith('oauth_');
    const _provider = hasPrefix ? provider : `oauth_${provider}`;

    if (hasPrefix) {
      deprecated(
        'getUserOauthAccessToken(userId, provider)',
        'Remove the `oauth_` prefix from the `provider` argument.',
      );
    }

    return this.request<PaginatedResourceResponse<OauthAccessToken[]>>({
      method: 'GET',
      path: joinPaths(basePath, userId, 'oauth_access_tokens', _provider),
      queryParams: { paginated: true },
    });
  }

  /**
   * Disable all of a user's MFA methods (e.g. [OTP](!otp) sent via SMS, TOTP on their authenticator app) at once.
   * @param userId - The ID of the user to disable MFA for.
   */
  public async disableUserMFA(userId: string) {
    this.requireId(userId);
    return this.request<UserID>({
      method: 'DELETE',
      path: joinPaths(basePath, userId, 'mfa'),
    });
  }

  /**
   * Gets a list of the given user's Organization memberships.
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property than contains an array of [`OrganizationMembership`](https://clerk.com/docs/reference/backend/types/backend-organization-membership) objects, and a `totalCount` property that indicates the total number of Organization memberships for the user.
   */
  public async getOrganizationMembershipList(params: GetOrganizationMembershipListParams) {
    const { userId, limit, offset } = params;
    this.requireId(userId);

    return this.request<PaginatedResourceResponse<OrganizationMembership[]>>({
      method: 'GET',
      path: joinPaths(basePath, userId, 'organization_memberships'),
      queryParams: { limit, offset },
    });
  }

  /**
   * Gets a list of the given user's Organization invitations.
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property than contains an array of [`OrganizationInvitation`](https://clerk.com/docs/reference/backend/types/backend-organization-invitation) objects, and a `totalCount` property that indicates the total number of Organization invitations for the user.
   */
  public async getOrganizationInvitationList(params: GetOrganizationInvitationListParams) {
    const { userId, ...queryParams } = params;
    this.requireId(userId);

    return this.request<PaginatedResourceResponse<OrganizationInvitation[]>>({
      method: 'GET',
      path: joinPaths(basePath, userId, 'organization_invitations'),
      queryParams,
    });
  }

  /** Check that the user's password matches the supplied input. Useful for custom auth flows and re-verification. */
  public async verifyPassword(params: VerifyPasswordParams) {
    const { userId, password } = params;
    this.requireId(userId);

    return this.request<{ verified: true }>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'verify_password'),
      bodyParams: { password },
    });
  }

  /** Verify that the provided TOTP or backup code is valid for the user. Verifying a backup code will result it in being consumed (i.e. it will become invalid). Useful for custom auth flows and re-verification. */
  public async verifyTOTP(params: VerifyTOTPParams) {
    const { userId, code } = params;
    this.requireId(userId);

    return this.request<{ verified: true; code_type: 'totp' }>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'verify_totp'),
      bodyParams: { code },
    });
  }

  /**
   * Marks the given [`User`](https://clerk.com/docs/reference/backend/types/backend-user) as banned, which means that all their sessions are revoked and they are not allowed to sign in again.
   * @param userId - The ID of the user to ban.
   */
  public async banUser(userId: string) {
    this.requireId(userId);
    return this.request<User>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'ban'),
    });
  }

  /**
   * Removes the ban mark from the given [`User`](https://clerk.com/docs/reference/backend/types/backend-user), allowing them to sign in again.
   * @param userId - The ID of the user to unban.
   */
  public async unbanUser(userId: string) {
    this.requireId(userId);
    return this.request<User>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'unban'),
    });
  }

  /**
   * Locks the given [`User`](https://clerk.com/docs/reference/backend/types/backend-user), which means that they are not allowed to sign in again until the lock expires or is manually unlocked. By default, lockout duration is 1 hour, but it can be configured in the application's [**Attack protection**](https://dashboard.clerk.com/~/protect/attack-protection) settings. See the [guide on user locks](https://clerk.com/docs/guides/secure/user-lockout).
   * @param userId - The ID of the user to lock.
   */
  public async lockUser(userId: string) {
    this.requireId(userId);
    return this.request<User>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'lock'),
    });
  }

  /** Removes a sign-in lock from the given [`User`](https://clerk.com/docs/reference/backend/types/backend-user), allowing them to sign in again. See the [guide on user locks](https://clerk.com/docs/guides/secure/user-lockout).
   * @param userId - The ID of the user to unlock.
   */
  public async unlockUser(userId: string) {
    this.requireId(userId);
    return this.request<User>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'unlock'),
    });
  }

  /**
   * Deletes a user's profile image.
   * @param userId - The ID of the user to delete the profile image for.
   * @returns The updated [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   */
  public async deleteUserProfileImage(userId: string) {
    this.requireId(userId);
    return this.request<User>({
      method: 'DELETE',
      path: joinPaths(basePath, userId, 'profile_image'),
    });
  }

  /**
   * Deletes the passkey identification for a given user and notifies them through email.
   * @returns A [`DeletedObjectResource`](https://clerk.com/docs/reference/types/deleted-object-resource).
   */
  public async deleteUserPasskey(params: DeleteUserPasskeyParams) {
    this.requireId(params.userId);
    this.requireId(params.passkeyIdentificationId);
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, params.userId, 'passkeys', params.passkeyIdentificationId),
    });
  }

  /**
   * Deletes a Web3 wallet identification for the given user.
   * @returns A [`DeletedObjectResource`](https://clerk.com/docs/reference/types/deleted-object-resource).
   */
  public async deleteUserWeb3Wallet(params: DeleteWeb3WalletParams) {
    this.requireId(params.userId);
    this.requireId(params.web3WalletIdentificationId);
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, params.userId, 'web3_wallets', params.web3WalletIdentificationId),
    });
  }

  /**
   * Deletes an external account for the given user.
   * @returns A [`DeletedObjectResource`](https://clerk.com/docs/reference/types/deleted-object-resource).
   */
  public async deleteUserExternalAccount(params: DeleteUserExternalAccountParams) {
    this.requireId(params.userId);
    this.requireId(params.externalAccountId);
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, params.userId, 'external_accounts', params.externalAccountId),
    });
  }

  /**
   * Deletes all backup codes for the given user.
   * @param userId - The ID of the user to delete backup codes for.
   */
  public async deleteUserBackupCodes(userId: string) {
    this.requireId(userId);
    return this.request<UserID>({
      method: 'DELETE',
      path: joinPaths(basePath, userId, 'backup_code'),
    });
  }

  /**
   * Deletes all of the TOTP secrets for the given user.
   * @param userId - The ID of the user to delete the TOTP secrets for.
   */
  public async deleteUserTOTP(userId: string) {
    this.requireId(userId);
    return this.request<UserID>({
      method: 'DELETE',
      path: joinPaths(basePath, userId, 'totp'),
    });
  }

  /**
   * Sets the given user's password as compromised. The user will be prompted to reset their password on their next sign-in. See the [guide on password protection and rules](/docs/guides/secure/password-protection-and-rules#reject-compromised-passwords) for more information.
   * @param userId - The ID of the user to set the password as compromised for.
   * @param params - Other parameters for the request.
   * @returns The updated [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   */
  public async setPasswordCompromised(
    userId: string,
    params: SetPasswordCompromisedParams = {
      revokeAllSessions: false,
    },
  ) {
    this.requireId(userId);
    return this.request<User>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'password', 'set_compromised'),
      bodyParams: params,
    });
  }

  /**
   * Unsets the given user's password as compromised. The user will no longer be prompted to reset their password on their next sign-in. See the [guide on password protection and rules](/docs/guides/secure/password-protection-and-rules#reject-compromised-passwords) for more information.
   * @param userId - The ID of the user to unset the password as compromised for.
   * @returns The updated [`User`](https://clerk.com/docs/reference/backend/types/backend-user).
   */
  public async unsetPasswordCompromised(userId: string) {
    this.requireId(userId);
    return this.request<User>({
      method: 'POST',
      path: joinPaths(basePath, userId, 'password', 'unset_compromised'),
    });
  }
}
