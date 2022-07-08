import React from 'react';

import { descriptors, Flex } from '../customizables';
import { usePopover, useSafeLayoutEffect, useScrollLock } from '../hooks';
import { animations, common, ThemableCssProp } from '../styledSystem';
import { Portal } from '../UserButton/Portal';

type ModalProps = React.PropsWithChildren<{
  handleOpen?: () => void;
  handleClose?: () => void;
  contentSx?: ThemableCssProp;
}>;

export const Modal = (props: ModalProps) => {
  const { handleClose, handleOpen, contentSx } = props;
  const { floating, isOpen } = usePopover({ defaultOpen: true, autoUpdate: false });
  const { disableScroll, enableScroll } = useScrollLock(document.body);

  React.useEffect(() => {
    if (!isOpen) {
      handleClose?.();
    } else {
      handleOpen?.();
    }
  }, [isOpen]);

  useSafeLayoutEffect(() => {
    disableScroll();
    return () => enableScroll();
  });

  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <Flex
        aria-hidden
        elementDescriptor={descriptors.modalBackdrop}
        sx={theme => ({
          animation: `${animations.fadeIn} 150ms ${theme.transitionTiming.$common}`,
          zIndex: theme.zIndices.$modal,
          backgroundColor: theme.colors.$modalBackdrop,
          ...common.centeredFlex(),
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
        })}
      >
        <Flex
          elementDescriptor={descriptors.modalContent}
          ref={floating}
          aria-modal='true'
          role='dialog'
          sx={[
            theme => ({
              animation: `${animations.modalSlideAndFade} 180ms ${theme.transitionTiming.$easeOut}`,
            }),
            contentSx,
          ]}
        >
          {props.children}
        </Flex>
      </Flex>
    </Portal>
  );
};
