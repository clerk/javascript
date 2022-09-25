import { ClerkAPIError, LocalizationResource } from '@clerk/types';
import React from 'react';

import { readObjectPath } from '../utils';
import { LocalizationKey, localizationKeys } from './localizationKeys';
import { useParsedLocalizationResource } from './parseLocalization';
import { applyTokensToString, GlobalTokens, useGlobalTokens } from './parseTokens';

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
  const parsedResource = useParsedLocalizationResource();
  const globalTokens = useGlobalTokens();

  const t = (localizationKey: LocalizationKey | string | undefined) => {
    if (!localizationKey || typeof localizationKey === 'string') {
      return localizationKey || '';
    }
    return localizedStringFromKey(localizationKey, parsedResource, globalTokens);
  };

  const translateError = (error: string | ClerkAPIError | undefined) => {
    if (!error || typeof error === 'string') {
      return t(error);
    }
    const { code, message } = error || {};
    if (!code) {
      return '';
    }
    return t(localizationKeys(`unstable__errors.${code}` as any)) || message;
  };

  return { t, translateError };
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
