import { useMemo } from 'react';

import { useAppearance } from './use-appearance';
import { useEnvironment } from './use-environment';

export function useDevModeWarning() {
  const { displayConfig, isDevelopmentOrStaging } = useEnvironment();
  const isDevelopment = isDevelopmentOrStaging();
  const { layout } = useAppearance();
  const developmentUiDisabled = isDevelopment && layout?.unsafe_disableDevelopmentModeWarnings;
  const showDevModeNotice = useMemo(
    () => !developmentUiDisabled && displayConfig.showDevModeWarning,
    [developmentUiDisabled, displayConfig],
  );
  return showDevModeNotice;
}
