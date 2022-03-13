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
  email_address_id: string;
  safe_identifier: string;
};

export type EmailLinkFactor = {
  strategy: EmailLinkStrategy;
  email_address_id: string;
  safe_identifier: string;
};

export type PhoneCodeFactor = {
  strategy: PhoneCodeStrategy;
  phone_number_id: string;
  safe_identifier: string;
  default?: boolean;
};

export type Web3SignatureFactor = {
  strategy: Web3Strategy;
  web3_wallet_id: string;
};

export type PasswordFactor = {
  strategy: PasswordStrategy;
};

export type OauthFactor = {
  strategy: OAuthStrategy;
};

export type EmailCodeConfig = Omit<EmailCodeFactor, 'safe_identifier'>;
export type EmailLinkConfig = Omit<EmailLinkFactor, 'safe_identifier'> & { redirect_url: string };
export type PhoneCodeConfig = Omit<PhoneCodeFactor, 'safe_identifier'>;
export type Web3SignatureConfig = Web3SignatureFactor;
export type OAuthConfig = OauthFactor & { redirect_url: string; action_complete_redirect_url: string };

export type PhoneCodeSecondFactorConfig = {
  strategy: PhoneCodeStrategy;
  phone_number_id?: string;
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
