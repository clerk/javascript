import type { ClerkAPIError, LocalizationResource } from '@clerk/types';
import React from 'react';

import { useOptions } from '../contexts';
import { readObjectPath } from '../utils';
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

  const translateError = (error: ClerkAPIError | string | undefined) => {
    if (!error || typeof error === 'string') {
      return t(error);
    }
    const { code, message, longMessage, meta } = error || {};
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
