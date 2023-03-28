import type { Attribute, Web3Provider } from '@clerk/types';

import type { LocalizationKey } from '../localization/localizationKeys';
import { localizationKeys } from '../localization/localizationKeys';

const FirstFactorConfigs = Object.freeze({
  email_address_username: {
    label: localizationKeys('formFieldLabel__emailAddress_username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress_username'),
    type: 'text',
    action: localizationKeys('signIn.start.useEmailOrUsernameActionLink'),
  },
  email_address: {
    label: localizationKeys('formFieldLabel__emailAddress'),
    placeholder: localizationKeys('formFieldInputPlaceholder__emailAddress'),
    type: 'email',
    action: localizationKeys('signIn.start.useEmailActionLink'),
  },
  phone_number: {
    label: localizationKeys('formFieldLabel__phoneNumber'),
    placeholder: localizationKeys('formFieldInputPlaceholder__phoneNumber'),
    type: 'tel',
    action: localizationKeys('signIn.start.usePhoneActionLink'),
  },
  username: {
    label: localizationKeys('formFieldLabel__username'),
    placeholder: localizationKeys('formFieldInputPlaceholder__username'),
    type: 'text',
    action: localizationKeys('signIn.start.useUsernameActionLink'),
  },
  default: {
    label: '',
    placeholder: '',
    type: 'text',
    action: '',
  },
} as Record<string, { label: string | LocalizationKey; type: string; placeholder: string | LocalizationKey; action?: string | LocalizationKey }>);

export const getIdentifierControlDisplayValues = (attributes: Attribute[], index: number) => {
  let newAttributes: string[] = [...attributes];
  //merge email_address and username attributes
  if (['email_address', 'username'].every(r => newAttributes.includes(r))) {
    newAttributes = newAttributes.filter(a => !['email_address', 'username'].includes(a));
    newAttributes.unshift('email_address_username');
  }

  return (
    {
      ...FirstFactorConfigs[newAttributes[index % newAttributes.length]],
      //return the action that corresponds to the next valid identifier in the cycle
      action:
        newAttributes.length > 1
          ? FirstFactorConfigs[newAttributes[(index + 1) % newAttributes.length]].action
          : undefined,
    } || FirstFactorConfigs['default']
  );
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
