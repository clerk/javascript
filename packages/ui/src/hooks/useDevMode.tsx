import { useMemo } from 'react';

import { useEnvironment } from '../contexts';
import { useAppearance } from '../customizables';

export function useDevMode() {
  const { displayConfig, isDevelopmentOrStaging } = useEnvironment();
  const isDevelopment = isDevelopmentOrStaging();
  const { parsedOptions, rawMode } = useAppearance();
  const { unsafe_disableDevelopmentModeWarnings = false } = parsedOptions;
  const developmentUiDisabled = isDevelopment && unsafe_disableDevelopmentModeWarnings;
  const showDevModeNotice = useMemo(
    () => !developmentUiDisabled && !rawMode && displayConfig.showDevModeWarning,
    [developmentUiDisabled, rawMode, displayConfig],
  );

  return {
    showDevModeNotice,
  };
}
