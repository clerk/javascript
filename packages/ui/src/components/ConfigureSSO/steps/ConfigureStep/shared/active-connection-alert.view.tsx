import { localizationKeys } from '@/customizables';
import { Alert } from '@/elements/Alert';

export const ActiveConnectionAlertView = ({
  isActive,
  isDismissed,
  dismiss,
}: {
  isActive: boolean;
  isDismissed: boolean;
  dismiss: () => void;
}): JSX.Element | null => {
  if (!isActive || isDismissed) {
    return null;
  }
  return (
    <Alert
      variant='warning'
      title={localizationKeys('configureSSO.configureStep.activeConnectionWarning.title')}
      dismissLabel={localizationKeys('configureSSO.configureStep.activeConnectionWarning.dismiss')}
      onDismiss={dismiss}
    />
  );
};
