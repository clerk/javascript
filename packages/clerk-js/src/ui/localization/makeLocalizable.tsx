import { ClerkAPIError, LocalizationResource } from '@clerk/types';
import React from 'react';

import { titleize } from '../shared';
import { readObjectPath } from '../utils';
import { LocalizationKey, localizationKeys } from './localizationKeys';
import { useParsedLocalizationResource } from './parseLocalization';

type Localizable<T = {}> = T & {
  localizationKey?: LocalizationKey | string;
};

type LocalizablePrimitive<T> = React.FunctionComponent<Localizable<T>>;

export const makeLocalizable = <P,>(Component: React.FunctionComponent<P>): LocalizablePrimitive<P> => {
  const localizableComponent = React.forwardRef((props: Localizable<any>, ref) => {
    const parsedResource = useParsedLocalizationResource();
    const { localizationKey, ...restProps } = props;

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
        {localizedStringFromKey(localizationKey, parsedResource) || restProps.children}
      </Component>
    );
  });

  const displayName = Component.displayName || Component.name || 'Component';
  localizableComponent.displayName = `Localizable${displayName}`.replace('_', '');
  return localizableComponent as LocalizablePrimitive<P>;
};

export const useLocalizations = () => {
  const parsedResource = useParsedLocalizationResource();

  const t = (localizationKey: LocalizationKey | string | undefined) => {
    if (!localizationKey || typeof localizationKey === 'string') {
      return localizationKey || '';
    }
    return localizedStringFromKey(localizationKey, parsedResource);
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

const localizedStringFromKey = (localizationKey: LocalizationKey, resource: LocalizationResource): string => {
  const key = localizationKey.key;
  const params = localizationKey.params;
  const base = readObjectPath(resource, key);
  let localizedStr = (base || '') as string;
  if (localizedStr) {
    for (const paramKey in params) {
      // TODO: Localizations v2: smarter pipe operator (|) for utils
      localizedStr = localizedStr.replace(`{{${paramKey}|titleize}}`, titleize(params[paramKey]));
      localizedStr = localizedStr.replace(`{{${paramKey}}}`, params[paramKey]);
    }
  }
  return localizedStr || '';
};
