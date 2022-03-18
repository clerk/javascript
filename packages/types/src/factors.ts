import {
  EmailCodeStrategy,
  EmailLinkStrategy,
  OAuthStrategy,
  PasswordStrategy,
  PhoneCodeStrategy,
  Web3Strategy,
} from './strategies';

export type EmailCodeFactor = {
  strategy: EmailCodeStrategy;
  emailAddressId: string;
  safeIdentifier: string;
};

export type EmailLinkFactor = {
  strategy: EmailLinkStrategy;
  emailAddressId: string;
  safeIdentifier: string;
};

export type PhoneCodeFactor = {
  strategy: PhoneCodeStrategy;
  phoneNumberId: string;
  safeIdentifier: string;
  default?: boolean;
};

export type Web3SignatureFactor = {
  strategy: Web3Strategy;
  web3WalletId: string;
};

export type PasswordFactor = {
  strategy: PasswordStrategy;
};

export type OauthFactor = {
  strategy: OAuthStrategy;
};

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
