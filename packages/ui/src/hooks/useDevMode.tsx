import { useMemo } from 'react';

import { useEnvironment } from '../contexts';
import { useAppearance } from '../customizables';

export function useDevMode() {
  const { displayConfig, isDevelopmentOrStaging } = useEnvironment();
  const isDevelopment = isDevelopmentOrStaging();
  const { unsafe_disableDevelopmentModeWarnings = false } = useAppearance().parsedOptions;
  const developmentUiDisabled = isDevelopment && unsafe_disableDevelopmentModeWarnings;
  const showDevModeNotice = useMemo(
    () => !developmentUiDisabled && displayConfig.showDevModeWarning,
    [developmentUiDisabled, displayConfig],
  );

  return {
    showDevModeNotice,
  };
}
