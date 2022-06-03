import type { Web3Provider } from '@clerk/types';

const FirstFactorConfigs = Object.freeze({
  email_address: {
    label: 'Email address',
    fieldType: 'email',
  },
  phone_number: {
    label: 'Phone number',
    fieldType: 'tel',
  },
  username: {
    label: 'Username',
    fieldType: 'text',
  },
  email_address_phone_number: {
    label: 'Email or phone',
    fieldType: 'text',
  },
  email_address_username: {
    label: 'Email or username',
    fieldType: 'text',
  },
  phone_number_username: {
    label: 'Phone number or username',
    fieldType: 'text',
  },
  email_address_phone_number_username: {
    label: 'Email, phone, or username',
    fieldType: 'text',
  },
  default: {
    label: '',
    fieldType: 'text',
  },
} as Record<string, { label: string; fieldType: string }>);

export const getIdentifierControlDisplayValues = (attributes: string[]) => {
  const indexKey = attributes.length == 0 ? null : [...attributes].sort().join('_');
  return FirstFactorConfigs[indexKey || 'default'];
};

export const PREFERRED_SIGN_IN_STRATEGIES = Object.freeze({
  Password: 'password',
  OTP: 'otp',
});

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
    name: 'MetaMask',
  },
});

export function getWeb3ProviderData(name: Web3Provider): Web3ProviderData | undefined | null {
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
