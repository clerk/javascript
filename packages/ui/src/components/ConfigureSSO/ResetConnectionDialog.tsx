import type { LocalizationKey } from '@/customizables';
import { withCardStateProvider } from '@/elements/contexts';

import { ConfigureSSODialogModalView } from './dialog-modal.view';
import { useResetConnectionDialogController } from './reset-connection-dialog.controller';
import { ResetConnectionDialogContentView } from './reset-connection-dialog.view';

type ResetConnectionDialogProps = {
  requestKey: string;
  canRun: () => boolean;
  isOpen: boolean;
  onClose: () => void;
  confirmationValue: string;
  onDelete: () => Promise<unknown>;
  contentRef: React.RefObject<HTMLDivElement>;
  subtitle: LocalizationKey;
  /** Defaults to the Reset copy; overridden when the dialog is reused for the Remove action. */
  title?: LocalizationKey;
  confirmButtonLabel?: LocalizationKey;
};

export const ResetConnectionDialog = (props: ResetConnectionDialogProps): JSX.Element | null => {
  if (!props.isOpen) {
    return null;
  }
  return (
    <ConfigureSSODialogModalView
      onClose={props.onClose}
      contentRef={props.contentRef}
    >
      <ResetConnectionDialogContent
        key={JSON.stringify([props.requestKey, props.confirmationValue])}
        {...props}
      />
    </ConfigureSSODialogModalView>
  );
};

const ResetConnectionDialogContent = withCardStateProvider((props: ResetConnectionDialogProps) => {
  const controller = useResetConnectionDialogController(
    props.confirmationValue,
    props.onDelete,
    props.onClose,
    props.canRun,
  );
  return (
    <ResetConnectionDialogContentView
      title={props.title}
      subtitle={props.subtitle}
      confirmButtonLabel={props.confirmButtonLabel}
      {...controller}
      onClose={props.onClose}
    />
  );
});
