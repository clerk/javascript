import type { Attribute, FieldId, Web3Provider } from '@clerk/types';

import type { LocalizationKey } from '../localization/localizationKeys';
import { localizationKeys } from '../localization/localizationKeys';

const FirstFactorConfigs = Object.freeze({
  email_address: {
    id: 'emailAddress',
    label: localizationKeys('formFieldLabel__emailAddress'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    type: 'email',
  },
  phone_number: {
    id: 'phoneNumber',
    label: localizationKeys('formFieldLabel__phoneNumber'),
    placeholder: localizationKeys('formFieldInputPlaceholder__phoneNumber'),
    type: 'tel',
  },
  username: {
    id: 'username',
    label: localizationKeys('formFieldLabel__username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__username'),
    type: 'text',
  },
  email_address_username: {
    id: 'emailAddressOrUsername',
    label: localizationKeys('formFieldLabel__emailAddress_username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress_username'),
    type: 'text',
  },
  default: {
    id: 'identifier',
    label: '',
    placeholder: '',
    type: 'text',
  },
} as Record<string, { id: FieldId; label: string | LocalizationKey; type: string; placeholder: string | LocalizationKey }>);

export const getIdentifierControlDisplayValues = (attributeGroups: Attribute[][], index: number) => {
  const attributeCycle = attributeGroups.length == 0 ? null : [...attributeGroups].sort().map(a => a.join('_'));
  return FirstFactorConfigs[attributeCycle?.[index % attributeCycle.length] || 'default'];
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
  return `https://images.clerk.com/static/${id}.svg`;
}
