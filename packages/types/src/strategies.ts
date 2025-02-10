import type { OAuthProvider } from './oauth';
import type { Web3Provider } from './web3';

export type GoogleOneTapStrategy = 'google_one_tap';
export type PasskeyStrategy = 'passkey';
export type PasswordStrategy = 'password';
export type PhoneCodeStrategy = 'phone_code';
export type EmailCodeStrategy = 'email_code';
export type EmailLinkStrategy = 'email_link';
export type TicketStrategy = 'ticket';
export type TOTPStrategy = 'totp';
export type BackupCodeStrategy = 'backup_code';
export type ResetPasswordPhoneCodeStrategy = 'reset_password_phone_code';
export type ResetPasswordEmailCodeStrategy = 'reset_password_email_code';
export type CustomOAuthStrategy = `oauth_custom_${string}`;
export type EnterpriseSSOStrategy = 'enterprise_sso';

export type OAuthStrategy = `oauth_${OAuthProvider}` | CustomOAuthStrategy;
export type Web3Strategy = `web3_${Web3Provider}_signature`;

/**
 * @deprecated Use `EnterpriseSSOStrategy` instead
 */
export type SamlStrategy = 'saml';
