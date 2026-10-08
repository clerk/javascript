import { useCallback } from 'react';

import { useAPIKeysContext } from '@/ui/contexts';
import { localizationKeys, useLocalizations } from '@/ui/customizables';

import type { CreateAPIKeyModel, Expiration } from './api-keys.types';
import { EXPIRATION_VALUES, getTimeLeftInSeconds } from './utils';

const getExpirationLocalizationKey = (expiration: Expiration) => {
  switch (expiration) {
    case 'never':
      return 'apiKeys.formFieldOption__expiration__never';
    case '1d':
      return 'apiKeys.formFieldOption__expiration__1d';
    case '7d':
      return 'apiKeys.formFieldOption__expiration__7d';
    case '30d':
      return 'apiKeys.formFieldOption__expiration__30d';
    case '60d':
      return 'apiKeys.formFieldOption__expiration__60d';
    case '90d':
      return 'apiKeys.formFieldOption__expiration__90d';
    case '180d':
      return 'apiKeys.formFieldOption__expiration__180d';
    case '1y':
      return 'apiKeys.formFieldOption__expiration__1y';
  }
};

export const useCreateAPIKeyModel = (): CreateAPIKeyModel => {
  const { showDescription = false } = useAPIKeysContext();
  const { t } = useLocalizations();
  const expirationCaption = useCallback(
    (expiration?: Expiration) => {
      const timeLeftInSeconds = getTimeLeftInSeconds(expiration);
      if (!expiration || !timeLeftInSeconds) {
        return t(localizationKeys('apiKeys.formFieldCaption__expiration__never'));
      }

      const expirationDate = new Date(Date.now() + timeLeftInSeconds * 1000);
      return t(
        localizationKeys('apiKeys.formFieldCaption__expiration__expiresOn', {
          date: expirationDate.toLocaleString(undefined, {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZoneName: 'short',
          }),
        }),
      );
    },
    [t],
  );

  return {
    showDescription,
    expirationOptions: EXPIRATION_VALUES.map(value => ({
      value,
      label: t(localizationKeys(getExpirationLocalizationKey(value))),
    })),
    expirationPlaceholder: t(localizationKeys('formFieldInputPlaceholder__apiKeyExpirationDate')),
    expirationCaption,
  };
};
