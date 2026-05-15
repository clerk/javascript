import type { __internal_LocalizationResource } from '@clerk/shared/types';

import { useConfigureSSO } from '../ConfigureSSOContext';
import type { ProviderType } from '../types';

/**
 * Camel-cased keys under `configureSSO.configureStep` that hold provider-specific
 * translations (e.g. `samlOkta`, `samlCustom`). Derived from the localization
 * resource so adding a new provider namespace updates this automatically.
 */
type ConfigureStepProviderKey = Extract<
  keyof __internal_LocalizationResource['configureSSO']['configureStep'],
  `saml${string}`
>;

export type TranslationKeyPrefix = `configureSSO.configureStep.${ConfigureStepProviderKey}`;

/**
 * Maps each {@link ProviderType} to the matching localization namespace under
 * `configureSSO.configureStep`. Typed via `satisfies` so the values are validated
 * against the localization resource shape while keeping literal types — that way
 * `` `${PROVIDER_TRANSLATION_KEY_PREFIX[provider]}.headerTitle` `` is still a
 * valid `DefaultLocalizationKey` at the call site.
 */
export const PROVIDER_TRANSLATION_KEY_PREFIX = {
  saml_okta: 'configureSSO.configureStep.samlOkta',
  saml_custom: 'configureSSO.configureStep.samlCustom',
} as const satisfies Record<ProviderType, TranslationKeyPrefix>;

/**
 * Builds a fully-qualified localization key under the active provider's
 * `configureSSO.configureStep` namespace. The return type is a literal template
 * string (e.g. `configureSSO.configureStep.samlOkta.createApp.headerTitle`) so
 * it remains a valid `DefaultLocalizationKey` accepted by `localizationKeys()`.
 */
export function getConfigureStepKey<P extends ProviderType, S extends string>(
  provider: P,
  suffix: S,
): `${(typeof PROVIDER_TRANSLATION_KEY_PREFIX)[P]}.${S}` {
  return `${PROVIDER_TRANSLATION_KEY_PREFIX[provider]}.${suffix}` as `${(typeof PROVIDER_TRANSLATION_KEY_PREFIX)[P]}.${S}`;
}

/**
 * Hook for the `ConfigureStep` wizard. Reads the active provider from
 * `ConfigureSSOContext` and returns:
 *
 * - `provider`: the currently selected provider (use it for conditional rendering).
 * - `key(suffix)`: builds a provider-scoped localization key for the configure step.
 *
 * Throws when called without a selected provider — `ConfigureStep` should only
 * be rendered after a provider has been chosen.
 */
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
