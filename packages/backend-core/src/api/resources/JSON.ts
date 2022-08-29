import {
  OrganizationInvitationStatus,
  OrganizationMembershipRole,
  SignInFactorStrategy,
  SignInIdentifier,
  SignInStatus,
  SignUpAttributeRequirements,
  SignUpIdentificationRequirements,
  SignUpStatus,
} from './Enums';

export enum ObjectType {
  AllowlistIdentifier = 'allowlist_identifier',
  Client = 'client',
  Email = 'email',
  EmailAddress = 'email_address',
  ExternalAccount = 'external_account',
  FacebookAccount = 'facebook_account',
  GoogleAccount = 'google_account',
  Invitation = 'invitation',
  Organization = 'organization',
  OrganizationInvitation = 'organization_invitation',
  OrganizationMembership = 'organization_membership',
  PhoneNumber = 'phone_number',
  RedirectUrl = 'redirect_url',
  Session = 'session',
  SignInAttempt = 'sign_in_attempt',
  SignInToken = 'sign_in_token',
  SignUpAttempt = 'sign_up_attempt',
  SmsMessage = 'sms_message',
  User = 'user',
  Web3Wallet = 'web3_wallet',
  Token = 'token',
  TotalCount = 'total_count',
}

export interface ClerkResourceJSON {
  object: ObjectType;
  id: string;
}

export interface TokenJSON {
  object: ObjectType.Token;
  jwt: string;
}

export interface AllowlistIdentifierJSON extends ClerkResourceJSON {
  object: ObjectType.AllowlistIdentifier;
  identifier: string;
  created_at: number;
  updated_at: number;
  invitation_id?: string;
}

export interface ClientJSON extends ClerkResourceJSON {
  object: ObjectType.Client;
  session_ids: string[];
  sessions: SessionJSON[];
  sign_in_attempt_id: string | null;
  sign_up_attempt_id: string | null;
  sign_in_id: string | null;
  sign_up_id: string | null;
  last_active_session_id: string | null;
  created_at: number;
  updated_at: number;
}

export interface EmailJSON extends ClerkResourceJSON {
  object: ObjectType.Email;
  from_email_name: string;
  to_email_address?: string;
  email_address_id: string | null;
  subject?: string;
  body?: string;
  status?: string;
}

export interface EmailAddressJSON extends ClerkResourceJSON {
  object: ObjectType.EmailAddress;
  email_address: string;
  verification: VerificationJSON | null;
  linked_to: Array<IdentificationLinkJSON>;
}

export interface ExternalAccountJSON extends ClerkResourceJSON {
  object: ObjectType.ExternalAccount;
  provider: string;
  identification_id: string;
  provider_user_id: string;
  approved_scopes: string;
  email_address: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  username: string | null;
  public_metadata: Record<string, unknown> | null;
  label: string | null;
  verification: VerificationJSON | null;
}

export interface IdentificationLinkJSON extends ClerkResourceJSON {
  type: string;
}

export interface InvitationJSON extends ClerkResourceJSON {
  object: ObjectType.Invitation;
  email_address: string;
  public_metadata: Record<string, unknown> | null;
  created_at: number;
  updated_at: number;
  revoked?: boolean;
}

export interface OrganizationJSON extends ClerkResourceJSON {
  object: ObjectType.Organization;
  name: string;
  slug: string | null;
  logo_url: string | null;
  public_metadata: Record<string, unknown> | null;
  private_metadata?: Record<string, unknown>;
  created_at: number;
  updated_at: number;
}

export interface OrganizationInvitationJSON extends ClerkResourceJSON {
  email_address: string;
  organization_id: string;
  role: OrganizationMembershipRole;
  status: OrganizationInvitationStatus;
  created_at: number;
  updated_at: number;
}

export interface OrganizationMembershipJSON extends ClerkResourceJSON {
  object: ObjectType.OrganizationMembership;
  organization: OrganizationJSON;
  public_metadata: Record<string, unknown>;
  private_metadata?: Record<string, unknown>;
  public_user_data: OrganizationMembershipPublicUserDataJSON;
  role: OrganizationMembershipRole;
  created_at: number;
  updated_at: number;
}

export interface OrganizationMembershipPublicUserDataJSON {
  identifier: string;
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string;
  user_id: string;
}

export interface PhoneNumberJSON extends ClerkResourceJSON {
  object: ObjectType.PhoneNumber;
  phone_number: string;
  reserved_for_second_factor: boolean;
  default_second_factor: boolean;
  linked_to: Array<IdentificationLinkJSON>;
  verification: VerificationJSON | null;
}

export interface RedirectUrlJSON extends ClerkResourceJSON {
  object: ObjectType.RedirectUrl;
  url: string;
  created_at: number;
  updated_at: number;
}

export interface SessionJSON extends ClerkResourceJSON {
  object: ObjectType.Session;
  client_id: string;
  user_id: string;
  status: string;
  last_active_at: number;
  expire_at: number;
  abandon_at: number;
  created_at: number;
  updated_at: number;
}

export interface SignInJSON extends ClerkResourceJSON {
  object: ObjectType.SignInToken;
  status: SignInStatus;
  allowed_identifier_types: SignInIdentifier[];
  identifier: string;
  allowed_factor_one_strategies: SignInFactorStrategy[];
  factor_one_verification: VerificationJSON | null;
  factor_two_verification: VerificationJSON | null;
  created_session_id: string | null;
}

export interface SignInTokenJSON extends ClerkResourceJSON {
  user_id: string;
  token: string;
  status: 'pending' | 'accepted' | 'revoked';
  created_at: number;
  updated_at: number;
}

export interface SignUpJSON extends ClerkResourceJSON {
  object: ObjectType.SignUpAttempt;
  status: SignUpStatus;
  identification_requirements: SignUpIdentificationRequirements;
  attribute_requirements: SignUpAttributeRequirements;
  username: string | null;
  email_address: string | null;
  email_address_verification: VerificationJSON | null;
  phone_number: string | null;
  phone_number_verification: VerificationJSON | null;
  web3_wallet: string | null;
  web3_wallet_verification: VerificationJSON | null;
  external_account_strategy: string | null;
  external_account_verification: VerificationJSON | null;
  external_account: any;
  has_password: boolean;
  name_full: string | null;
  created_session_id: string | null;
  created_user_id: string | null;
  abandon_at: number | null;
}

export interface SMSMessageJSON extends ClerkResourceJSON {
  object: ObjectType.SmsMessage;
  from_phone_number: string;
  to_phone_number: string;
  phone_number_id: string | null;
  message: string;
  status: string;
}

export interface UserJSON extends ClerkResourceJSON {
  object: ObjectType.User;
  username: string;
  first_name: string;
  last_name: string;
  gender: string;
  birthday: string;
  profile_image_url: string;
  primary_email_address_id: string;
  primary_phone_number_id: string;
  primary_web3_wallet_id: string;
  password_enabled: boolean;
  totp_enabled: boolean;
  two_factor_enabled: boolean;
  email_addresses: EmailAddressJSON[];
  phone_numbers: PhoneNumberJSON[];
  web3_wallets: Web3WalletJSON[];
  external_accounts: ExternalAccountJSON[];
  external_id: string;
  last_sign_in_at: number;
  public_metadata: Record<string, unknown>;
  private_metadata: Record<string, unknown>;
  unsafe_metadata: Record<string, unknown>;
  created_at: number;
  updated_at: number;
}

export interface VerificationJSON extends ClerkResourceJSON {
  attempts?: number | null;
  expire_at: number;
  external_verification_redirect_url?: string;
  nonce?: string | null;
  status: string;
  strategy: string;
  verified_at_client?: string;
  // error?
}

export interface Web3WalletJSON extends ClerkResourceJSON {
  object: ObjectType.Web3Wallet;
  web3_wallet: string;
  verification: VerificationJSON | null;
}
