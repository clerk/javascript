import type { OAuthProvider, Web3Provider } from '@clerk/types';

export const FirstFactorConfigs = Object.freeze({
  email_address: {
    label: 'Email address',
    icon: 'clerk-email',
    fieldType: 'email',
  },
  phone_number: {
    label: 'Phone number',
    icon: 'clerk-phone',
    fieldType: 'tel',
  },
  username: {
    label: 'Username',
    icon: 'clerk-person',
    fieldType: 'text',
  },
  email_address_phone_number: {
    label: 'Email or phone',
    icon: 'clerk-person',
    fieldType: 'text',
  },
  email_address_username: {
    label: 'Email or username',
    icon: 'clerk-person',
    fieldType: 'text',
  },
  phone_number_username: {
    label: 'Phone number or username',
    icon: 'clerk-person',
    fieldType: 'text',
  },
  email_address_phone_number_username: {
    label: 'Email, phone, or username',
    icon: 'clerk-person',
    fieldType: 'text',
  },
} as Record<string, { label: string; icon: string; fieldType: string }>);

export const PREFERRED_SIGN_IN_STRATEGIES = Object.freeze({
  Password: 'password',
  OTP: 'otp',
});
interface OAuthProviderData {
  id: string;
  name: string;
}

type OAuthProviders = {
  [key in OAuthProvider]: OAuthProviderData;
};

export const OAUTH_PROVIDERS: OAuthProviders = Object.freeze({
  facebook: {
    id: 'facebook',
    name: 'Facebook',
  },
  google: {
    id: 'google',
    name: 'Google',
  },
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
  },
  github: {
    id: 'github',
    name: 'GitHub',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
  },
  gitlab: {
    id: 'gitlab',
    name: 'GitLab',
  },
  discord: {
    id: 'discord',
    name: 'Discord',
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter',
  },
  twitch: {
    id: 'twitch',
    name: 'Twitch',
  },
});

export function getOAuthProviderData(
  name: OAuthProvider,
): OAuthProviderData | undefined | null {
  return OAUTH_PROVIDERS[name];
}

interface Web3ProviderData {
  id: string;
  name: string;
}

type Web3Providers = {
  [key in Web3Provider]: Web3ProviderData;
};

export const WEB3_PROVIDERS: Web3Providers = Object.freeze({
  metamask: {
    id: 'metamask',
    name: 'Metamask',
  },
});

export function getWeb3ProviderData(
  name: Web3Provider,
): Web3ProviderData | undefined | null {
  return WEB3_PROVIDERS[name];
}

export function svgUrl(id: string): string {
  return `https://images.clerk.dev/static/${id}.svg`;
}

export const ERROR_CODES = {
  FORM_IDENTIFIER_NOT_FOUND: 'form_identifier_not_found',
  FORM_PASSWORD_INCORRECT: 'form_password_incorrect',
  INVALID_STRATEGY_FOR_USER: 'strategy_for_user_invalid',
  NOT_ALLOWED_TO_SIGN_UP: 'not_allowed_to_sign_up',
  OAUTH_ACCESS_DENIED: 'oauth_access_denied',
};
