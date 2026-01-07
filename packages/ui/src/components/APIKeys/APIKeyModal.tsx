import React from 'react';

import { Modal } from '@/ui/elements/Modal';
import type { ThemableCssProp } from '@/ui/styledSystem';

type APIKeyModalProps = React.ComponentProps<typeof Modal> & {
  modalRoot?: React.MutableRefObject<HTMLElement | null>;
};

/**
 * Container styles for modals rendered within a custom portal root (e.g., UserProfile or OrganizationProfile).
 * When a modalRoot is provided, the modal is scoped to that container rather than the document root,
 * requiring different positioning (absolute instead of fixed) and backdrop styling.
 */
const getScopedPortalContainerStyles = (modalRoot?: React.MutableRefObject<HTMLElement | null>): ThemableCssProp => {
  return [
    { alignItems: 'center' },
    modalRoot
      ? t => ({
          position: 'absolute',
          right: 0,
          bottom: 0,
          backgroundColor: 'inherit',
          backdropFilter: `blur(${t.sizes.$2})`,
          display: 'flex',
          justifyContent: 'center',
          minHeight: '100%',
          height: '100%',
          width: '100%',
          borderRadius: t.radii.$lg,
        })
      : {},
  ];
};

export const APIKeyModal = ({ modalRoot, containerSx, ...modalProps }: APIKeyModalProps) => {
  return (
    <Modal
      {...modalProps}
      portalRoot={modalRoot}
      containerSx={[getScopedPortalContainerStyles(modalRoot), containerSx]}
    />
  );
};
