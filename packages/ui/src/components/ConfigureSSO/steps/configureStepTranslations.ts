import type { __internal_LocalizationResource } from '@clerk/shared/types';

import { useConfigureSSO } from '../ConfigureSSOContext';
import type { ProviderType } from '../types';

type ConfigureStepProviderKey = Extract<
  keyof __internal_LocalizationResource['configureSSO']['configureStep'],
  `saml${string}`
>;

export type TranslationKeyPrefix = `configureSSO.configureStep.${ConfigureStepProviderKey}`;

export const PROVIDER_TRANSLATION_KEY_PREFIX = {
  saml_okta: 'configureSSO.configureStep.samlOkta',
  saml_custom: 'configureSSO.configureStep.samlCustom',
} as const satisfies Record<ProviderType, TranslationKeyPrefix>;

export function getConfigureStepKey<P extends ProviderType, S extends string>(
  provider: P,
  suffix: S,
): `${(typeof PROVIDER_TRANSLATION_KEY_PREFIX)[P]}.${S}` {
  return `${PROVIDER_TRANSLATION_KEY_PREFIX[provider]}.${suffix}`;
}

export function useConfigureStepTranslations() {
  const { provider } = useConfigureSSO();
  if (!provider) {
    throw new Error('useConfigureStepTranslations called without a selected provider.');
  }

  return {
    provider,
    key: <S extends string>(suffix: S) => getConfigureStepKey(provider, suffix),
  } as const;
}
