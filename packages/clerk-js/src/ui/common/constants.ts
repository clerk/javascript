import type { Attribute, Web3Provider } from '@clerk/types';

import type { LocalizationKey } from '../localization/localizationKeys';
import { localizationKeys } from '../localization/localizationKeys';

type FirstFactorConfig = {
  label: string | LocalizationKey;
  type: string;
  placeholder: string | LocalizationKey;
  action?: string | LocalizationKey;
};
const FirstFactorConfigs = Object.freeze({
  email_address_username: {
    label: localizationKeys('formFieldLabel__emailAddress_username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress_username'),
    type: 'text',
    action: localizationKeys('signIn.start.actionLink__use_email_username'),
  },
  email_address: {
    label: localizationKeys('formFieldLabel__emailAddress'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    type: 'email',
    action: localizationKeys('signIn.start.actionLink__use_email'),
  },
  phone_number: {
    label: localizationKeys('formFieldLabel__phoneNumber'),
    placeholder: localizationKeys('formFieldInputPlaceholder__phoneNumber'),
    type: 'tel',
    action: localizationKeys('signIn.start.actionLink__use_phone'),
  },
  username: {
    label: localizationKeys('formFieldLabel__username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__username'),
    type: 'text',
    action: localizationKeys('signIn.start.actionLink__use_username'),
  },
  default: {
    label: '',
    placeholder: '',
    type: 'text',
    action: '',
  },
} as Record<SignInStartIdentifier | 'default', FirstFactorConfig>);

export type SignInStartIdentifier = 'email_address' | 'username' | 'phone_number' | 'email_address_username';
export const groupIdentifiers = (attributes: Attribute[]): SignInStartIdentifier[] => {
  let newAttributes: string[] = [...attributes];
  //merge email_address and username attributes
  if (['email_address', 'username'].every(r => newAttributes.includes(r))) {
    newAttributes = newAttributes.filter(a => !['email_address', 'username'].includes(a));
    newAttributes.unshift('email_address_username');
  }

  return newAttributes as SignInStartIdentifier[];
};

export const getIdentifierControlDisplayValues = (
  identifiers: SignInStartIdentifier[],
  identifier: SignInStartIdentifier,
): { currentIdentifier: FirstFactorConfig; nextIdentifier?: FirstFactorConfig } => {
  const index = identifiers.indexOf(identifier);

  if (index === -1) {
    return { currentIdentifier: { ...FirstFactorConfigs['default'] }, nextIdentifier: undefined };
  }

  return {
    currentIdentifier: { ...FirstFactorConfigs[identifier] },
    nextIdentifier:
      identifiers.length > 1 ? { ...FirstFactorConfigs[identifiers[(index + 1) % identifiers.length]] } : undefined,
  };
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

/**
 * Returns the URL for a static SVG image
 * using the old images.clerk.com service
 * @deprecated In favor of iconImageUrl
 */
export function svgUrl(id: string): string {
  return `https://images.clerk.com/static/${id}.svg`;
}

/**
 * Returns the URL for a static SVG image
 * using the new img.clerk.com service
 */
export function iconImageUrl(id: string): string {
  return `https://img.clerk.com/static/${id}.svg`;
}
