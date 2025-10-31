import { isClerkRuntimeError } from '@clerk/shared/error';
import type { ClerkAPIError, ClerkRuntimeError, LocalizationResource } from '@clerk/shared/types';
import React from 'react';

import { useOptions } from '../contexts';
import { readObjectPath } from '../utils/readObjectPath';
import type { GlobalTokens } from './applyTokensToString';
import { applyTokensToString, useGlobalTokens } from './applyTokensToString';
import { defaultResource } from './defaultEnglishResource';
import type { LocalizationKey } from './localizationKeys';
import { localizationKeys } from './localizationKeys';
import { useParsedLocalizationResource } from './parseLocalization';

type Localizable<T> = T & {
  localizationKey?: LocalizationKey | string;
};

type LocalizablePrimitive<T> = React.FunctionComponent<Localizable<T>>;

export const makeLocalizable = <P,>(Component: React.FunctionComponent<P>): LocalizablePrimitive<P> => {
  const localizableComponent = React.forwardRef((props: Localizable<any>, ref) => {
    const parsedResource = useParsedLocalizationResource();
    const { localizationKey, ...restProps } = props;
    const globalTokens = useGlobalTokens();

    if (!localizationKey) {
      return (
        <Component
          {...restProps}
          ref={ref}
        />
      );
    }

    if (typeof localizationKey === 'string') {
      return (
        <Component
          {...restProps}
          ref={ref}
        >
          {localizationKey}
        </Component>
      );
    }

    return (
      <Component
        {...restProps}
        ref={ref}
        data-localization-key={localizationKeyAttribute(localizationKey)}
      >
        {localizedStringFromKey(localizationKey, parsedResource, globalTokens) || restProps.children}
      </Component>
    );
  });

  const displayName = Component.displayName || Component.name || 'Component';
  localizableComponent.displayName = `Localizable${displayName}`.replace('_', '');
  return localizableComponent as LocalizablePrimitive<P>;
};

export const useLocalizations = () => {
  const { localization } = useOptions();
  const parsedResource = useParsedLocalizationResource();
  const globalTokens = useGlobalTokens();

  const t = (localizationKey: LocalizationKey | string | undefined) => {
    if (!localizationKey || typeof localizationKey === 'string') {
      return localizationKey || '';
    }
    return localizedStringFromKey(localizationKey, parsedResource, globalTokens);
  };

  /**
   * Translates a Clerk error message based on its code.
   *
   * @remarks
   * - For `ClerkRuntimeError`, it attempts to find a localized message using the error code.
   * - For `ClerkAPIError`, it tries to find a localized message using the error code and parameter name.
   * - If no localized message is found, it falls back to the original error message.
   */
  const translateError = (error: ClerkRuntimeError | ClerkAPIError | string | undefined) => {
    if (!error || typeof error === 'string') {
      return t(error);
    }

    if (isClerkRuntimeError(error)) {
      return t(localizationKeys(`unstable__errors.${error.code}` as any)) || error.message;
    }

    const { code, message, longMessage, meta } = (error || {}) as ClerkAPIError;
    const { paramName = '' } = meta || {};

    if (!code) {
      return '';
    }

    return (
      t(localizationKeys(`unstable__errors.${code}__${paramName}` as any)) ||
      t(localizationKeys(`unstable__errors.${code}` as any)) ||
      longMessage ||
      message
    );
  };

  return { t, translateError, locale: localization?.locale || defaultResource?.locale };
};

const localizationKeyAttribute = (localizationKey: LocalizationKey) => {
  return localizationKey.key;
};

const localizedStringFromKey = (
  localizationKey: LocalizationKey,
  resource: LocalizationResource,
  globalTokens: GlobalTokens,
): string => {
  const key = localizationKey.key;
  const base = readObjectPath(resource, key) as string;
  const params = localizationKey.params;
  const tokens = { ...globalTokens, ...params };
  return applyTokensToString(base || '', tokens);
};
