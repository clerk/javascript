import { type JSX } from 'react';

import { localizationKeys } from '@/customizables';
import { Alert } from '@/elements/Alert';

import { useConfigureSSO } from '../../../../ConfigureSSOContext';

export const ActiveConnectionAlert = (): JSX.Element | null => {
  const { enterpriseConnection } = useConfigureSSO();

  if (!enterpriseConnection?.active) {
    return null;
  }

  return (
    <Alert
      variant='warning'
      title={localizationKeys('configureSSO.configureStep.activeConnectionWarning.title')}
    />
  );
};
