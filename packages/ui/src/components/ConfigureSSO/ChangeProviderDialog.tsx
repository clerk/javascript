import type { LocalizationKey } from '@/customizables';
import { withCardStateProvider } from '@/elements/contexts';

import { useChangeProviderDialogModel } from './change-provider-dialog.model';
import { ChangeProviderDialogContentView } from './change-provider-dialog.view';
import { ConfigureSSODialogModalView } from './dialog-modal.view';

type ChangeProviderDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  nextProviderLabel: LocalizationKey;
  currentProviderLabel: LocalizationKey;
  connectionName: string;
  contentRef: React.RefObject<HTMLDivElement>;
};

export const ChangeProviderDialog = (props: ChangeProviderDialogProps): JSX.Element | null => {
  if (!props.isOpen) {
    return null;
  }
  return (
    <ConfigureSSODialogModalView
      onClose={props.onClose}
      contentRef={props.contentRef}
    >
      <ChangeProviderDialogContent {...props} />
    </ConfigureSSODialogModalView>
  );
};

const ChangeProviderDialogContent = withCardStateProvider((props: ChangeProviderDialogProps) => {
  const model = useChangeProviderDialogModel(props.nextProviderLabel, props.currentProviderLabel);
  return (
    <ChangeProviderDialogContentView
      {...model}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      isSubmitting={props.isSubmitting}
      connectionName={props.connectionName}
    />
  );
});
