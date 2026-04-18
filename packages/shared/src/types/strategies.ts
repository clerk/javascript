import type { OAuthProvider } from './oauth';
import type { Web3Provider } from './web3';

/** @inline */
export type GoogleOneTapStrategy = 'google_one_tap';
/** @inline */
export type AppleIdTokenStrategy = 'oauth_token_apple';
/** @inline */
export type PasskeyStrategy = 'passkey';
/** @inline */
export type PasswordStrategy = 'password';
/** @inline */
export type PhoneCodeStrategy = 'phone_code';
/** @inline */
export type EmailCodeStrategy = 'email_code';
/** @inline */
export type EmailLinkStrategy = 'email_link';
/** @inline */
export type TicketStrategy = 'ticket';
/** @inline */
export type TOTPStrategy = 'totp';
/** @inline */
export type BackupCodeStrategy = 'backup_code';
/** @inline */
export type ResetPasswordPhoneCodeStrategy = 'reset_password_phone_code';
/** @inline */
export type ResetPasswordEmailCodeStrategy = 'reset_password_email_code';
/** @inline */
export type CustomOAuthStrategy = `oauth_custom_${string}`;
/** @inline */
export type EnterpriseSSOStrategy = 'enterprise_sso';

/** @inline */
export type OAuthStrategy = `oauth_${OAuthProvider}` | CustomOAuthStrategy;

/** @inline */
export type Web3Strategy = `web3_${Web3Provider}_signature`;
