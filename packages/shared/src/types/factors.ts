import type { PublicKeyCredentialWithAuthenticatorAssertionResponse } from './passkey';
import type { PhoneCodeChannel } from './phoneCodeChannel';
import type {
  BackupCodeStrategy,
  EmailCodeStrategy,
  EmailLinkStrategy,
  EnterpriseSSOStrategy,
  OAuthStrategy,
  PasskeyStrategy,
  PasswordStrategy,
  PhoneCodeStrategy,
  ResetPasswordEmailCodeStrategy,
  ResetPasswordPhoneCodeStrategy,
  TOTPStrategy,
  Web3Strategy,
} from './strategies';

/** @document */
export type EmailCodeFactor = {
  /**
   * The strategy type.
   */
  strategy: EmailCodeStrategy;
  /**
   * The ID of the email address used for the email code factor.
   */
  emailAddressId: string;
  /**
   * The identifier provided by the user, but masked for security reasons.
   */
  safeIdentifier: string;
  /**
   * Indicates whether the email address is set as the primary email address, as multiple can be added to a user's profile.
   */
  primary?: boolean;
};

/** @document */
export type EmailLinkFactor = {
  /**
   * The strategy type.
   */
  strategy: EmailLinkStrategy;
  /**
   * The ID of the email address used for the email link factor.
   */
  emailAddressId: string;
  /**
   * The identifier provided by the user, but masked for security reasons.
   */
  safeIdentifier: string;
  /**
   * Indicates whether the email address is set as the primary email address, as multiple can be added to a user's profile.
   */
  primary?: boolean;
};

/** @document */
export type PhoneCodeFactor = {
  /**
   * The strategy type.
   */
  strategy: PhoneCodeStrategy;
  /**
   * The ID of the phone number used for the phone code factor.
   */
  phoneNumberId: string;
  /**
   * The identifier provided by the user, but masked for security reasons.
   */
  safeIdentifier: string;
  /**
   * Indicates whether the phone number is set as the primary phone number, as multiple can be added to a user's profile.
   */
  primary?: boolean;
  /**
   * Indicates whether the phone number is set as the default identifier.
   */
  default?: boolean;
  /**
   * The channel used for the phone code factor.
   */
  channel?: PhoneCodeChannel;
};

/** @document */
export type Web3SignatureFactor = {
  /**
   * The strategy type.
   */
  strategy: Web3Strategy;
  /**
   * The ID of the Web3 Wallet.
   */
  web3WalletId: string;
  /**
   * Indicates whether the Web3 Wallet is set as the primary Web3 Wallet, as multiple can be added to a user's profile.
   */
  primary?: boolean;
  /**
   * The name of the Web3 Wallet.
   */
  walletName?: string;
};

/** @inline */
export type PasswordFactor = {
  strategy: PasswordStrategy;
};

/** @inline */
export type PasskeyFactor = {
  strategy: PasskeyStrategy;
};

/** @inline */
export type OauthFactor = {
  strategy: OAuthStrategy;
};

/** @document */
export type EnterpriseSSOFactor = {
  /**
   * The strategy type.
   */
  strategy: EnterpriseSSOStrategy;
  /**
   * The ID of the enterprise connection.
   * @experimental
   */
  enterpriseConnectionId?: string;
  /**
   * The name of the enterprise connection.
   * @experimental
   */
  enterpriseConnectionName?: string;
};

/** @inline */
export type TOTPFactor = {
  strategy: TOTPStrategy;
};

/** @inline */
export type BackupCodeFactor = {
  strategy: BackupCodeStrategy;
};

/** @document */
export type ResetPasswordPhoneCodeFactor = {
  /**
   * The strategy type.
   */
  strategy: ResetPasswordPhoneCodeStrategy;
  /**
   * The ID of the phone number used for the reset password phone code factor.
   */
  phoneNumberId: string;
  /**
   * The identifier provided by the user, but masked for security reasons.
   */
  safeIdentifier: string;
  /**
   * Indicates whether the phone number is set as the primary phone number, as multiple can be added to a user's profile.
   */
  primary?: boolean;
};

/** @document */
export type ResetPasswordEmailCodeFactor = {
  /**
   * The strategy type.
   */
  strategy: ResetPasswordEmailCodeStrategy;
  /**
   * The ID of the email address used for the reset password email code factor.
   */
  emailAddressId: string;
  /**
   * The identifier provided by the user, but masked for security reasons.
   */
  safeIdentifier: string;
  /**
   * Indicates whether the email address is set as the primary email address, as multiple can be added to a user's profile.
   */
  primary?: boolean;
};

/** @document */
export type ResetPasswordCodeFactor = ResetPasswordEmailCodeFactor | ResetPasswordPhoneCodeFactor;

/** @document */
export type ResetPasswordPhoneCodeFactorConfig = Omit<ResetPasswordPhoneCodeFactor, 'safeIdentifier'>;
/** @document */
export type ResetPasswordEmailCodeFactorConfig = Omit<ResetPasswordEmailCodeFactor, 'safeIdentifier'>;

/** @document */
export type EmailCodeConfig = Omit<EmailCodeFactor, 'safeIdentifier'>;
/** @document */
export type EmailLinkConfig = Omit<EmailLinkFactor, 'safeIdentifier'> & {
  /**
   * The URL to redirect to after the email link is clicked.
   */
  redirectUrl: string;
};
/** @document */
export type PhoneCodeConfig = Omit<PhoneCodeFactor, 'safeIdentifier'>;
/** @document */
export type Web3SignatureConfig = Web3SignatureFactor;

/** @inline */
export type PassKeyConfig = PasskeyFactor;

/** @document */
export type OAuthConfig = OauthFactor & {
  /**
   * The URL to redirect to after the OAuth flow is completed.
   */
  redirectUrl: string;
  /**
   *
   */
  actionCompleteRedirectUrl: string;
  /**
   * The OIDC prompt parameter to use for the OAuth flow.
   */
  oidcPrompt?: string;
  /**
   * The OIDC login hint parameter to use for the OAuth flow.
   */
  oidcLoginHint?: string;
};

/** @document */
export type EnterpriseSSOConfig = EnterpriseSSOFactor & {
  /**
   * The URL to redirect to after the OAuth flow is completed.
   */
  redirectUrl: string;
  /**
   *
   */
  actionCompleteRedirectUrl: string;
  /**
   * The OIDC prompt parameter to use for the OAuth flow.
   */
  oidcPrompt?: string;
  /**
   * The ID of the email address used for the enterprise SSO factor.
   * @experimental
   */
  emailAddressId?: string;
  /**
   * The ID of the enterprise connection used for the enterprise SSO factor.
   * @experimental
   */
  enterpriseConnectionId?: string;
};

/** @document */
export type PhoneCodeSecondFactorConfig = {
  /**
   * The strategy type.
   */
  strategy: PhoneCodeStrategy;
  /**
   * The ID of the phone number used for the phone code second factor.
   */
  phoneNumberId?: string;
};

/** @document */
export type EmailCodeSecondFactorConfig = {
  /**
   * The strategy type.
   */
  strategy: EmailCodeStrategy;
  /**
   * The ID of the email address used for the email code second factor.
   */
  emailAddressId?: string;
};

/**
 * @document
 */
export type EmailCodeAttempt = {
  /**
   * The strategy type.
   */
  strategy: EmailCodeStrategy;
  /**
   * The one-time code sent to the user's email.
   */
  code: string;
};

/**
 * @document
 */
export type PhoneCodeAttempt = {
  /**
   * The strategy type.
   */
  strategy: PhoneCodeStrategy;
  /**
   * The one-time code sent via SMS.
   */
  code: string;
};

/**
 * @document
 */
export type PasswordAttempt = {
  /**
   * The strategy type.
   */
  strategy: PasswordStrategy;
  /**
   * The user's password.
   */
  password: string;
};

/**
 * @document
 */
export type PasskeyAttempt = {
  /**
   * The strategy type.
   */
  strategy: PasskeyStrategy;
  /**
   * The Web Authentication assertion returned by the browser.
   */
  publicKeyCredential: PublicKeyCredentialWithAuthenticatorAssertionResponse;
};

/** @document */
export type Web3Attempt = {
  /**
   * The strategy type.
   */
  strategy: Web3Strategy;
  /**
   * The signature of the Web3 transaction.
   */
  signature: string;
};

/** @document */
export type TOTPAttempt = {
  /**
   * The strategy type.
   */
  strategy: TOTPStrategy;
  /**
   * The code generated by the authenticator app.
   */
  code: string;
};

/** @document */
export type BackupCodeAttempt = {
  /**
   * The strategy type.
   */
  strategy: BackupCodeStrategy;
  /**
   * The backup code.
   */
  code: string;
};

/** @document */
export type ResetPasswordPhoneCodeAttempt = {
  /**
   * The strategy type.
   */
  strategy: ResetPasswordPhoneCodeStrategy;
  /**
   * The one-time code sent via SMS.
   */
  code: string;
  /**
   * The password provided by the user.
   */
  password?: string;
};

/** @document */
export type ResetPasswordEmailCodeAttempt = {
  /**
   * The strategy type.
   */
  strategy: ResetPasswordEmailCodeStrategy;
  /**
   * The one-time code sent to the user's email.
   */
  code: string;
  /**
   * The password provided by the user.
   */
  password?: string;
};
