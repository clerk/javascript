import type { LocalizationKey } from '@/customizables';
import { localizationKeys } from '@/customizables';

import type { EnterpriseConnectionProviderType, ProviderType } from '../types';
import { isOidcProvider } from './organizationEnterpriseConnection';

export interface ProviderOption {
  id: ProviderType;
  label: LocalizationKey;
  iconId: string;
}

export interface ProviderGroup {
  id: 'saml' | 'oidc';
  label: LocalizationKey;
  options: ReadonlyArray<ProviderOption>;
}

export const PROVIDER_GROUPS: ReadonlyArray<ProviderGroup> = [
  {
    id: 'saml',
    label: localizationKeys('configureSSO.selectProviderStep.saml.groupLabel'),
    options: [
      { id: 'saml_okta', label: localizationKeys('configureSSO.selectProviderStep.saml.okta'), iconId: 'okta' },
      {
        id: 'saml_microsoft',
        label: localizationKeys('configureSSO.selectProviderStep.saml.microsoft'),
        iconId: 'microsoft',
      },
      {
        id: 'saml_google',
        label: localizationKeys('configureSSO.selectProviderStep.saml.google'),
        iconId: 'google',
      },
      {
        id: 'saml_custom',
        label: localizationKeys('configureSSO.selectProviderStep.saml.customSaml'),
        iconId: 'saml',
      },
    ],
  },
  {
    id: 'oidc',
    label: localizationKeys('configureSSO.selectProviderStep.oidc.groupLabel'),
    options: [
      {
        id: 'oidc_custom',
        label: localizationKeys('configureSSO.selectProviderStep.oidc.oidcProvider'),
        iconId: 'oidc',
      },
    ],
  },
];

export const providerLabel = (provider: ProviderType): LocalizationKey | undefined =>
  PROVIDER_GROUPS.flatMap(group => group.options).find(option => option.id === provider)?.label;

/** Every OIDC variant is presented as the single OIDC card. */
export const toProviderCard = (provider: EnterpriseConnectionProviderType): ProviderType =>
  isOidcProvider(provider) ? 'oidc_custom' : provider;
