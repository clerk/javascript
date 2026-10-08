import { withCardStateProvider } from '@/elements/contexts';

import { ConfigureSSODialogModalView } from './dialog-modal.view';
import { useRemoveDomainDialogController } from './remove-domain-dialog.controller';
import { RemoveDomainDialogContentView } from './remove-domain-dialog.view';

type RemoveDomainDialogProps = {
  scopeKey: string;
  canRun: () => boolean;
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  isConnectionActive: boolean;
  onRemove: () => Promise<unknown>;
  contentRef: React.RefObject<HTMLDivElement>;
};

export const RemoveDomainDialog = (props: RemoveDomainDialogProps): JSX.Element | null => {
  if (!props.isOpen) {
    return null;
  }
  return (
    <ConfigureSSODialogModalView
      onClose={props.onClose}
      contentRef={props.contentRef}
    >
      <RemoveDomainDialogContent
        key={JSON.stringify([props.scopeKey, props.domain])}
        {...props}
      />
    </ConfigureSSODialogModalView>
  );
};

const RemoveDomainDialogContent = withCardStateProvider((props: RemoveDomainDialogProps) => {
  const controller = useRemoveDomainDialogController(props.onRemove, props.onClose, props.canRun);
  return (
    <RemoveDomainDialogContentView
      domain={props.domain}
      isConnectionActive={props.isConnectionActive}
      {...controller}
      onClose={props.onClose}
    />
  );
});
