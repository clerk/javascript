import type { Web3Provider } from '@clerk/types';

import type { LocalizationKey } from '../localization/localizationKeys';
import { localizationKeys } from '../localization/localizationKeys';

const FirstFactorConfigs = Object.freeze({
  email_address: {
    label: localizationKeys('formFieldLabel__emailAddress'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    type: 'email',
  },
  phone_number: {
    label: localizationKeys('formFieldLabel__phoneNumber'),
    placeholder: localizationKeys('formFieldInputPlaceholder__phoneNumber'),
    type: 'tel',
  },
  username: {
    label: localizationKeys('formFieldLabel__username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__username'),
    type: 'text',
  },
  email_address_phone_number: {
    label: localizationKeys('formFieldLabel__emailAddress_phoneNumber'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress_phoneNumber'),
    type: 'text',
  },
  email_address_username: {
    label: localizationKeys('formFieldLabel__emailAddress_username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress_username'),
    type: 'text',
  },
  phone_number_username: {
    label: localizationKeys('formFieldLabel__phoneNumber_username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__phoneNumber_username'),
    type: 'text',
  },
  email_address_phone_number_username: {
    label: localizationKeys('formFieldLabel__emailAddress_phoneNumber_username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress_phoneNumber_username'),
    type: 'text',
  },
  default: {
    label: '',
    placeholder: '',
    type: 'text',
  },
} as Record<string, { label: string | LocalizationKey; type: string; placeholder: string | LocalizationKey }>);

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
