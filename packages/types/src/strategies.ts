import type { OAuthProvider } from './oauth';
import type { Web3Provider } from './web3';

export type PasswordStrategy = 'password';
export type PhoneCodeStrategy = 'phone_code';
export type EmailCodeStrategy = 'email_code';
export type EmailLinkStrategy = 'email_link';
export type TicketStrategy = 'ticket';
export type TOTPStrategy = 'totp';
export type BackupCodeStrategy = 'backup_code';
export type ResetPasswordCodeStrategy = 'reset_password_code';
export type OAuthStrategy = `oauth_${OAuthProvider}`;
export type Web3Strategy = `web3_${Web3Provider}_signature`;

/**
 * @experimental
 */
export type SamlStrategy = 'saml';
