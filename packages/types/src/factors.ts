import type {
  BackupCodeStrategy,
  EmailCodeStrategy,
  EmailLinkStrategy,
  OAuthStrategy,
  PasswordStrategy,
  PhoneCodeStrategy,
  ResetPasswordCodeStrategy,
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

export type OauthFactor = {
  strategy: OAuthStrategy;
};

/**
 * @experimental
 */
export type SamlFactor = {
  strategy: SamlStrategy;
};

export type TOTPFactor = {
  strategy: TOTPStrategy;
};

export type BackupCodeFactor = {
  strategy: BackupCodeStrategy;
};

export type ResetPasswordCodeFactor = {
  strategy: ResetPasswordCodeStrategy;
  emailAddressId?: string;
  safeIdentifier: string;
  primary?: boolean;
  phoneNumberId?: string;
};

export type ResetPasswordCodeFactorConfig = Omit<ResetPasswordCodeFactor, 'safeIdentifier'>;

export type EmailCodeConfig = Omit<EmailCodeFactor, 'safeIdentifier'>;
export type EmailLinkConfig = Omit<EmailLinkFactor, 'safeIdentifier'> & {
  redirectUrl: string;
};
export type PhoneCodeConfig = Omit<PhoneCodeFactor, 'safeIdentifier'>;
export type Web3SignatureConfig = Web3SignatureFactor;
export type OAuthConfig = OauthFactor & {
  redirectUrl: string;
  actionCompleteRedirectUrl: string;
};

/**
 * @experimental
 */
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

export type ResetPasswordCodeAttempt = {
  strategy: ResetPasswordCodeStrategy;
  code: string;
};
