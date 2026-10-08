import type React from 'react';

import { Modal } from '@/elements/Modal';

export const ConfigureSSODialogModalView = ({
  onClose,
  contentRef,
  children,
}: {
  onClose: () => void;
  contentRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}): JSX.Element => {
  return (
    <Modal
      handleClose={onClose}
      canCloseModal={false}
      portalRoot={contentRef}
      containerSx={t => ({
        alignItems: 'center',
        position: 'absolute',
        inset: 0,
        width: 'auto',
        height: 'auto',
        backgroundColor: 'inherit',
        backdropFilter: `blur(${t.sizes.$2})`,
      })}
    >
      {children}
    </Modal>
  );
};
