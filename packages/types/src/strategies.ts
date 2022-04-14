import { OAuthProvider } from './oauth';
import { Web3Provider } from './web3';

export type PasswordStrategy = 'password';
export type PhoneCodeStrategy = 'phone_code';
export type EmailCodeStrategy = 'email_code';
export type EmailLinkStrategy = 'email_link';
export type TicketStrategy = 'ticket';

export type OAuthStrategy = `oauth_${OAuthProvider}`;
export type Web3Strategy = `web3_${Web3Provider}_signature`;
