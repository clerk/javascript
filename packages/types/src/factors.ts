import type { __experimental_PublicKeyCredentialWithAuthenticatorAssertionResponse } from './passkey';
import type {
  __experimental_PasskeyStrategy,
  BackupCodeStrategy,
  EmailCodeStrategy,
  EmailLinkStrategy,
  OAuthStrategy,
  PasswordStrategy,
  PhoneCodeStrategy,
  ResetPasswordEmailCodeStrategy,
  ResetPasswordPhoneCodeStrategy,
  SamlStrategy,
  TOTPStrategy,
  Web3Strategy,
} from './strategies';

export type EmailCodeFactor = {
  strategy: EmailCodeStrategy;
  emailAddressId: string;
  safeIdentifier: string;
  primary?: boolean;
};

export type EmailLinkFactor = {
  strategy: EmailLinkStrategy;
  emailAddressId: string;
  safeIdentifier: string;
  primary?: boolean;
};

export type PhoneCodeFactor = {
  strategy: PhoneCodeStrategy;
  phoneNumberId: string;
  safeIdentifier: string;
  primary?: boolean;
  default?: boolean;
};

export type Web3SignatureFactor = {
  strategy: Web3Strategy;
  web3WalletId: string;
  primary?: boolean;
};

export type PasswordFactor = {
  strategy: PasswordStrategy;
};

/**
 * @experimental
 */
export type __experimental_PasskeyFactor = {
  strategy: __experimental_PasskeyStrategy;
};

export type OauthFactor = {
  strategy: OAuthStrategy;
};

export type SamlFactor = {
  strategy: SamlStrategy;
};

export type TOTPFactor = {
  strategy: TOTPStrategy;
};

export type BackupCodeFactor = {
  strategy: BackupCodeStrategy;
};

export type ResetPasswordPhoneCodeFactor = {
  strategy: ResetPasswordPhoneCodeStrategy;
  phoneNumberId: string;
  safeIdentifier: string;
  primary?: boolean;
};

export type ResetPasswordEmailCodeFactor = {
  strategy: ResetPasswordEmailCodeStrategy;
  emailAddressId: string;
  safeIdentifier: string;
  primary?: boolean;
};

export type ResetPasswordCodeFactor = ResetPasswordEmailCodeFactor | ResetPasswordPhoneCodeFactor;

export type ResetPasswordPhoneCodeFactorConfig = Omit<ResetPasswordPhoneCodeFactor, 'safeIdentifier'>;
export type ResetPasswordEmailCodeFactorConfig = Omit<ResetPasswordEmailCodeFactor, 'safeIdentifier'>;

export type EmailCodeConfig = Omit<EmailCodeFactor, 'safeIdentifier'>;
export type EmailLinkConfig = Omit<EmailLinkFactor, 'safeIdentifier'> & {
  redirectUrl: string;
};
export type PhoneCodeConfig = Omit<PhoneCodeFactor, 'safeIdentifier'>;
export type Web3SignatureConfig = Web3SignatureFactor;
/**
 * @experimental
 */
export type __experimental_PassKeyConfig = __experimental_PasskeyFactor;
export type OAuthConfig = OauthFactor & {
  redirectUrl: string;
  actionCompleteRedirectUrl: string;
};

export type SamlConfig = SamlFactor & {
  redirectUrl: string;
  actionCompleteRedirectUrl: string;
};

export type PhoneCodeSecondFactorConfig = {
  strategy: PhoneCodeStrategy;
  phoneNumberId?: string;
};

export type EmailCodeAttempt = {
  strategy: EmailCodeStrategy;
  code: string;
};

export type PhoneCodeAttempt = {
  strategy: PhoneCodeStrategy;
  code: string;
};

export type PasswordAttempt = {
  strategy: PasswordStrategy;
  password: string;
};

/**
 * @experimental
 */
export type __experimental_PasskeyAttempt = {
  strategy: __experimental_PasskeyStrategy;
  publicKeyCredential: __experimental_PublicKeyCredentialWithAuthenticatorAssertionResponse;
};

export type Web3Attempt = {
  strategy: Web3Strategy;
  signature: string;
};

export type TOTPAttempt = {
  strategy: TOTPStrategy;
  code: string;
};

export type BackupCodeAttempt = {
  strategy: BackupCodeStrategy;
  code: string;
};

export type ResetPasswordPhoneCodeAttempt = {
  strategy: ResetPasswordPhoneCodeStrategy;
  code: string;
  password?: string;
};

export type ResetPasswordEmailCodeAttempt = {
  strategy: ResetPasswordEmailCodeStrategy;
  code: string;
  password?: string;
};
