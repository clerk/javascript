import { Button, descriptors, localizationKeys } from '@/customizables';

import { ResetConnectionDialog } from '../ResetConnectionDialog';
import type { useFooterResetModel } from './footer-reset.model';

type Props = ReturnType<typeof useFooterResetModel> & { isOpen: boolean; open: () => void; close: () => void };

export const FooterResetView = ({ dialog, isOpen, open, close }: Props): JSX.Element | null => {
  if (!dialog) {
    return null;
  }

  return (
    <>
      <Button
        elementDescriptor={descriptors.configureSSOFooterResetButton}
        variant='ghost'
        size='sm'
        colorScheme='danger'
        onClick={open}
        localizationKey={localizationKeys('configureSSO.resetConnectionDialog.resetButton')}
        sx={{ marginInlineEnd: 'auto' }}
      />
      <ResetConnectionDialog
        requestKey={dialog.requestKey}
        canRun={dialog.canRun}
        isOpen={isOpen}
        onClose={close}
        confirmationValue={dialog.confirmationValue}
        subtitle={dialog.subtitle}
        onDelete={dialog.onDelete}
        contentRef={dialog.contentRef}
      />
    </>
  );
};
