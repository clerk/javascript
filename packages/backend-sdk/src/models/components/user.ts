/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { ClosedEnum } from '../../types/enums.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';
import {
  EmailAddress,
  EmailAddress$inboundSchema,
  EmailAddress$Outbound,
  EmailAddress$outboundSchema,
} from './emailaddress.js';
import {
  PhoneNumber,
  PhoneNumber$inboundSchema,
  PhoneNumber$Outbound,
  PhoneNumber$outboundSchema,
} from './phonenumber.js';
import {
  SAMLAccount,
  SAMLAccount$inboundSchema,
  SAMLAccount$Outbound,
  SAMLAccount$outboundSchema,
} from './samlaccount.js';
import {
  SchemasPasskey,
  SchemasPasskey$inboundSchema,
  SchemasPasskey$Outbound,
  SchemasPasskey$outboundSchema,
} from './schemaspasskey.js';
import { Web3Wallet, Web3Wallet$inboundSchema, Web3Wallet$Outbound, Web3Wallet$outboundSchema } from './web3wallet.js';

/**
 * String representing the object's type. Objects of the same type share the same value.
 *
 * @remarks
 */
export const UserObject = {
  User: 'user',
} as const;
/**
 * String representing the object's type. Objects of the same type share the same value.
 *
 * @remarks
 */
export type UserObject = ClosedEnum<typeof UserObject>;

export type ExternalAccounts = {};

/**
 * Success
 */
export type User = {
  id?: string | undefined;
  /**
   * String representing the object's type. Objects of the same type share the same value.
   *
   * @remarks
   */
  object?: UserObject | undefined;
  externalId?: string | null | undefined;
  primaryEmailAddressId?: string | null | undefined;
  primaryPhoneNumberId?: string | null | undefined;
  primaryWeb3WalletId?: string | null | undefined;
  username?: string | null | undefined;
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  /**
   * @deprecated field: This will be removed in a future release, please migrate away from it as soon as possible.
   */
  profileImageUrl?: string | undefined;
  imageUrl?: string | undefined;
  hasImage?: boolean | undefined;
  publicMetadata?: { [k: string]: any } | undefined;
  privateMetadata?: { [k: string]: any } | null | undefined;
  unsafeMetadata?: { [k: string]: any } | undefined;
  emailAddresses?: Array<EmailAddress> | undefined;
  phoneNumbers?: Array<PhoneNumber> | undefined;
  web3Wallets?: Array<Web3Wallet> | undefined;
  passkeys?: Array<SchemasPasskey> | undefined;
  passwordEnabled?: boolean | undefined;
  twoFactorEnabled?: boolean | undefined;
  totpEnabled?: boolean | undefined;
  backupCodeEnabled?: boolean | undefined;
  /**
   * Unix timestamp of when MFA was last enabled for this user. It should be noted that this field is not nullified if MFA is disabled.
   *
   * @remarks
   */
  mfaEnabledAt?: number | null | undefined;
  /**
   * Unix timestamp of when MFA was last disabled for this user. It should be noted that this field is not nullified if MFA is enabled again.
   *
   * @remarks
   */
  mfaDisabledAt?: number | null | undefined;
  externalAccounts?: Array<ExternalAccounts> | undefined;
  samlAccounts?: Array<SAMLAccount> | undefined;
  /**
   * Unix timestamp of last sign-in.
   *
   * @remarks
   */
  lastSignInAt?: number | null | undefined;
  /**
   * Flag to denote whether user is banned or not.
   *
   * @remarks
   */
  banned?: boolean | undefined;
  /**
   * Flag to denote whether user is currently locked, i.e. restricted from signing in or not.
   *
   * @remarks
   */
  locked?: boolean | undefined;
  /**
   * The number of seconds remaining until the lockout period expires for a locked user. A null value for a locked user indicates that lockout never expires.
   *
   * @remarks
   */
  lockoutExpiresInSeconds?: number | null | undefined;
  /**
   * The number of verification attempts remaining until the user is locked. Null if account lockout is not enabled. Note: if a user is locked explicitly via the Backend API, they may still have verification attempts remaining.
   *
   * @remarks
   */
  verificationAttemptsRemaining?: number | null | undefined;
  /**
   * Unix timestamp of last update.
   *
   * @remarks
   */
  updatedAt?: number | undefined;
  /**
   * Unix timestamp of creation.
   *
   * @remarks
   */
  createdAt?: number | undefined;
  /**
   * If enabled, user can delete themselves via FAPI.
   *
   * @remarks
   */
  deleteSelfEnabled?: boolean | undefined;
  /**
   * If enabled, user can create organizations via FAPI.
   *
   * @remarks
   */
  createOrganizationEnabled?: boolean | undefined;
  /**
   * The maximum number of organizations the user can create. 0 means unlimited.
   *
   * @remarks
   */
  createOrganizationsLimit?: number | null | undefined;
  /**
   * Unix timestamp of the latest session activity, with day precision.
   *
   * @remarks
   */
  lastActiveAt?: number | null | undefined;
  /**
   * Unix timestamp of when the user accepted the legal requirements.
   *
   * @remarks
   */
  legalAcceptedAt?: number | null | undefined;
};

/** @internal */
export const UserObject$inboundSchema: z.ZodNativeEnum<typeof UserObject> = z.nativeEnum(UserObject);

/** @internal */
export const UserObject$outboundSchema: z.ZodNativeEnum<typeof UserObject> = UserObject$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UserObject$ {
  /** @deprecated use `UserObject$inboundSchema` instead. */
  export const inboundSchema = UserObject$inboundSchema;
  /** @deprecated use `UserObject$outboundSchema` instead. */
  export const outboundSchema = UserObject$outboundSchema;
}

/** @internal */
export const ExternalAccounts$inboundSchema: z.ZodType<ExternalAccounts, z.ZodTypeDef, unknown> = z.object({});

/** @internal */
export type ExternalAccounts$Outbound = {};

/** @internal */
export const ExternalAccounts$outboundSchema: z.ZodType<ExternalAccounts$Outbound, z.ZodTypeDef, ExternalAccounts> =
  z.object({});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace ExternalAccounts$ {
  /** @deprecated use `ExternalAccounts$inboundSchema` instead. */
  export const inboundSchema = ExternalAccounts$inboundSchema;
  /** @deprecated use `ExternalAccounts$outboundSchema` instead. */
  export const outboundSchema = ExternalAccounts$outboundSchema;
  /** @deprecated use `ExternalAccounts$Outbound` instead. */
  export type Outbound = ExternalAccounts$Outbound;
}

export function externalAccountsToJSON(externalAccounts: ExternalAccounts): string {
  return JSON.stringify(ExternalAccounts$outboundSchema.parse(externalAccounts));
}

export function externalAccountsFromJSON(jsonString: string): SafeParseResult<ExternalAccounts, SDKValidationError> {
  return safeParse(
    jsonString,
    x => ExternalAccounts$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'ExternalAccounts' from JSON`,
  );
}

/** @internal */
export const User$inboundSchema: z.ZodType<User, z.ZodTypeDef, unknown> = z
  .object({
    id: z.string().optional(),
    object: UserObject$inboundSchema.optional(),
    external_id: z.nullable(z.string()).optional(),
    primary_email_address_id: z.nullable(z.string()).optional(),
    primary_phone_number_id: z.nullable(z.string()).optional(),
    primary_web3_wallet_id: z.nullable(z.string()).optional(),
    username: z.nullable(z.string()).optional(),
    first_name: z.nullable(z.string()).optional(),
    last_name: z.nullable(z.string()).optional(),
    profile_image_url: z.string().optional(),
    image_url: z.string().optional(),
    has_image: z.boolean().optional(),
    public_metadata: z.record(z.any()).optional(),
    private_metadata: z.nullable(z.record(z.any())).optional(),
    unsafe_metadata: z.record(z.any()).optional(),
    email_addresses: z.array(EmailAddress$inboundSchema).optional(),
    phone_numbers: z.array(PhoneNumber$inboundSchema).optional(),
    web3_wallets: z.array(Web3Wallet$inboundSchema).optional(),
    passkeys: z.array(SchemasPasskey$inboundSchema).optional(),
    password_enabled: z.boolean().optional(),
    two_factor_enabled: z.boolean().optional(),
    totp_enabled: z.boolean().optional(),
    backup_code_enabled: z.boolean().optional(),
    mfa_enabled_at: z.nullable(z.number().int()).optional(),
    mfa_disabled_at: z.nullable(z.number().int()).optional(),
    external_accounts: z.array(z.lazy(() => ExternalAccounts$inboundSchema)).optional(),
    saml_accounts: z.array(SAMLAccount$inboundSchema).optional(),
    last_sign_in_at: z.nullable(z.number().int()).optional(),
    banned: z.boolean().optional(),
    locked: z.boolean().optional(),
    lockout_expires_in_seconds: z.nullable(z.number().int()).optional(),
    verification_attempts_remaining: z.nullable(z.number().int()).optional(),
    updated_at: z.number().int().optional(),
    created_at: z.number().int().optional(),
    delete_self_enabled: z.boolean().optional(),
    create_organization_enabled: z.boolean().optional(),
    create_organizations_limit: z.nullable(z.number().int()).optional(),
    last_active_at: z.nullable(z.number().int()).optional(),
    legal_accepted_at: z.nullable(z.number().int()).optional(),
  })
  .transform(v => {
    return remap$(v, {
      external_id: 'externalId',
      primary_email_address_id: 'primaryEmailAddressId',
      primary_phone_number_id: 'primaryPhoneNumberId',
      primary_web3_wallet_id: 'primaryWeb3WalletId',
      first_name: 'firstName',
      last_name: 'lastName',
      profile_image_url: 'profileImageUrl',
      image_url: 'imageUrl',
      has_image: 'hasImage',
      public_metadata: 'publicMetadata',
      private_metadata: 'privateMetadata',
      unsafe_metadata: 'unsafeMetadata',
      email_addresses: 'emailAddresses',
      phone_numbers: 'phoneNumbers',
      web3_wallets: 'web3Wallets',
      password_enabled: 'passwordEnabled',
      two_factor_enabled: 'twoFactorEnabled',
      totp_enabled: 'totpEnabled',
      backup_code_enabled: 'backupCodeEnabled',
      mfa_enabled_at: 'mfaEnabledAt',
      mfa_disabled_at: 'mfaDisabledAt',
      external_accounts: 'externalAccounts',
      saml_accounts: 'samlAccounts',
      last_sign_in_at: 'lastSignInAt',
      lockout_expires_in_seconds: 'lockoutExpiresInSeconds',
      verification_attempts_remaining: 'verificationAttemptsRemaining',
      updated_at: 'updatedAt',
      created_at: 'createdAt',
      delete_self_enabled: 'deleteSelfEnabled',
      create_organization_enabled: 'createOrganizationEnabled',
      create_organizations_limit: 'createOrganizationsLimit',
      last_active_at: 'lastActiveAt',
      legal_accepted_at: 'legalAcceptedAt',
    });
  });

/** @internal */
export type User$Outbound = {
  id?: string | undefined;
  object?: string | undefined;
  external_id?: string | null | undefined;
  primary_email_address_id?: string | null | undefined;
  primary_phone_number_id?: string | null | undefined;
  primary_web3_wallet_id?: string | null | undefined;
  username?: string | null | undefined;
  first_name?: string | null | undefined;
  last_name?: string | null | undefined;
  profile_image_url?: string | undefined;
  image_url?: string | undefined;
  has_image?: boolean | undefined;
  public_metadata?: { [k: string]: any } | undefined;
  private_metadata?: { [k: string]: any } | null | undefined;
  unsafe_metadata?: { [k: string]: any } | undefined;
  email_addresses?: Array<EmailAddress$Outbound> | undefined;
  phone_numbers?: Array<PhoneNumber$Outbound> | undefined;
  web3_wallets?: Array<Web3Wallet$Outbound> | undefined;
  passkeys?: Array<SchemasPasskey$Outbound> | undefined;
  password_enabled?: boolean | undefined;
  two_factor_enabled?: boolean | undefined;
  totp_enabled?: boolean | undefined;
  backup_code_enabled?: boolean | undefined;
  mfa_enabled_at?: number | null | undefined;
  mfa_disabled_at?: number | null | undefined;
  external_accounts?: Array<ExternalAccounts$Outbound> | undefined;
  saml_accounts?: Array<SAMLAccount$Outbound> | undefined;
  last_sign_in_at?: number | null | undefined;
  banned?: boolean | undefined;
  locked?: boolean | undefined;
  lockout_expires_in_seconds?: number | null | undefined;
  verification_attempts_remaining?: number | null | undefined;
  updated_at?: number | undefined;
  created_at?: number | undefined;
  delete_self_enabled?: boolean | undefined;
  create_organization_enabled?: boolean | undefined;
  create_organizations_limit?: number | null | undefined;
  last_active_at?: number | null | undefined;
  legal_accepted_at?: number | null | undefined;
};

/** @internal */
export const User$outboundSchema: z.ZodType<User$Outbound, z.ZodTypeDef, User> = z
  .object({
    id: z.string().optional(),
    object: UserObject$outboundSchema.optional(),
    externalId: z.nullable(z.string()).optional(),
    primaryEmailAddressId: z.nullable(z.string()).optional(),
    primaryPhoneNumberId: z.nullable(z.string()).optional(),
    primaryWeb3WalletId: z.nullable(z.string()).optional(),
    username: z.nullable(z.string()).optional(),
    firstName: z.nullable(z.string()).optional(),
    lastName: z.nullable(z.string()).optional(),
    profileImageUrl: z.string().optional(),
    imageUrl: z.string().optional(),
    hasImage: z.boolean().optional(),
    publicMetadata: z.record(z.any()).optional(),
    privateMetadata: z.nullable(z.record(z.any())).optional(),
    unsafeMetadata: z.record(z.any()).optional(),
    emailAddresses: z.array(EmailAddress$outboundSchema).optional(),
    phoneNumbers: z.array(PhoneNumber$outboundSchema).optional(),
    web3Wallets: z.array(Web3Wallet$outboundSchema).optional(),
    passkeys: z.array(SchemasPasskey$outboundSchema).optional(),
    passwordEnabled: z.boolean().optional(),
    twoFactorEnabled: z.boolean().optional(),
    totpEnabled: z.boolean().optional(),
    backupCodeEnabled: z.boolean().optional(),
    mfaEnabledAt: z.nullable(z.number().int()).optional(),
    mfaDisabledAt: z.nullable(z.number().int()).optional(),
    externalAccounts: z.array(z.lazy(() => ExternalAccounts$outboundSchema)).optional(),
    samlAccounts: z.array(SAMLAccount$outboundSchema).optional(),
    lastSignInAt: z.nullable(z.number().int()).optional(),
    banned: z.boolean().optional(),
    locked: z.boolean().optional(),
    lockoutExpiresInSeconds: z.nullable(z.number().int()).optional(),
    verificationAttemptsRemaining: z.nullable(z.number().int()).optional(),
    updatedAt: z.number().int().optional(),
    createdAt: z.number().int().optional(),
    deleteSelfEnabled: z.boolean().optional(),
    createOrganizationEnabled: z.boolean().optional(),
    createOrganizationsLimit: z.nullable(z.number().int()).optional(),
    lastActiveAt: z.nullable(z.number().int()).optional(),
    legalAcceptedAt: z.nullable(z.number().int()).optional(),
  })
  .transform(v => {
    return remap$(v, {
      externalId: 'external_id',
      primaryEmailAddressId: 'primary_email_address_id',
      primaryPhoneNumberId: 'primary_phone_number_id',
      primaryWeb3WalletId: 'primary_web3_wallet_id',
      firstName: 'first_name',
      lastName: 'last_name',
      profileImageUrl: 'profile_image_url',
      imageUrl: 'image_url',
      hasImage: 'has_image',
      publicMetadata: 'public_metadata',
      privateMetadata: 'private_metadata',
      unsafeMetadata: 'unsafe_metadata',
      emailAddresses: 'email_addresses',
      phoneNumbers: 'phone_numbers',
      web3Wallets: 'web3_wallets',
      passwordEnabled: 'password_enabled',
      twoFactorEnabled: 'two_factor_enabled',
      totpEnabled: 'totp_enabled',
      backupCodeEnabled: 'backup_code_enabled',
      mfaEnabledAt: 'mfa_enabled_at',
      mfaDisabledAt: 'mfa_disabled_at',
      externalAccounts: 'external_accounts',
      samlAccounts: 'saml_accounts',
      lastSignInAt: 'last_sign_in_at',
      lockoutExpiresInSeconds: 'lockout_expires_in_seconds',
      verificationAttemptsRemaining: 'verification_attempts_remaining',
      updatedAt: 'updated_at',
      createdAt: 'created_at',
      deleteSelfEnabled: 'delete_self_enabled',
      createOrganizationEnabled: 'create_organization_enabled',
      createOrganizationsLimit: 'create_organizations_limit',
      lastActiveAt: 'last_active_at',
      legalAcceptedAt: 'legal_accepted_at',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace User$ {
  /** @deprecated use `User$inboundSchema` instead. */
  export const inboundSchema = User$inboundSchema;
  /** @deprecated use `User$outboundSchema` instead. */
  export const outboundSchema = User$outboundSchema;
  /** @deprecated use `User$Outbound` instead. */
  export type Outbound = User$Outbound;
}

export function userToJSON(user: User): string {
  return JSON.stringify(User$outboundSchema.parse(user));
}

export function userFromJSON(jsonString: string): SafeParseResult<User, SDKValidationError> {
  return safeParse(jsonString, x => User$inboundSchema.parse(JSON.parse(x)), `Failed to parse 'User' from JSON`);
}
