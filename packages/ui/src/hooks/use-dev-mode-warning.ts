import { useMemo } from 'react';

import { useAppearance } from './use-appearance';
import { useEnvironment } from './use-environment';

export function useDevModeWarning() {
  const { displayConfig, isDevelopmentOrStaging } = useEnvironment();
  const isDevelopment = isDevelopmentOrStaging();
  const { layout } = useAppearance();
  const unsafeDisabled = layout?.unsafe_disableDevelopmentModeWarnings || false;
  const developmentUiDisabled = isDevelopment && unsafeDisabled;
  const showDevModeWarning = useMemo(
    () => !developmentUiDisabled && displayConfig.showDevModeWarning,
    [developmentUiDisabled, displayConfig],
  );
  return showDevModeWarning;
}
