import React, { type JSX } from 'react';

import { localizationKeys } from '@/customizables';
import { Alert } from '@/elements/Alert';

import { useConfigureSSO } from '../../../../ConfigureSSOContext';

export const ActiveConnectionAlert = (): JSX.Element | null => {
  const { enterpriseConnection } = useConfigureSSO();
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (!enterpriseConnection?.active || isDismissed) {
    return null;
  }

  return (
    <Alert
      variant='warning'
      title={localizationKeys('configureSSO.configureStep.activeConnectionWarning.title')}
      dismissLabel={localizationKeys('configureSSO.configureStep.activeConnectionWarning.dismiss')}
      onDismiss={() => setIsDismissed(true)}
    />
  );
};
