import { useMemo } from 'react';

import { useAppearance } from '~/contexts';

import { useEnvironment } from './use-environment';

export function useDevModeWarning() {
  const { displayConfig, isDevelopmentOrStaging } = useEnvironment();
  const isDevelopment = isDevelopmentOrStaging();
  const { options } = useAppearance().parsedAppearance;
  const unsafeDisabled = options?.unsafe_disableDevelopmentModeWarnings || false;
  const developmentUiDisabled = isDevelopment && unsafeDisabled;
  const showDevModeWarning = useMemo(
    () => !developmentUiDisabled && displayConfig.showDevModeWarning,
    [developmentUiDisabled, displayConfig],
  );
  return showDevModeWarning;
}
