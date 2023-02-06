import React from 'react';

import { descriptors, Flex, Icon } from '../customizables';
import { usePopover, useSafeLayoutEffect, useScrollLock } from '../hooks';
import { Close } from '../icons';
import type { ThemableCssProp } from '../styledSystem';
import { animations, mqu } from '../styledSystem';
import { withFloatingTree } from './contexts';
import { IconButton } from './IconButton';
import { Popover } from './Popover';

type ModalProps = React.PropsWithChildren<{
  handleOpen?: () => void;
  handleClose?: () => void;
  contentSx?: ThemableCssProp;
  containerSx?: ThemableCssProp;
}>;

export const Modal = withFloatingTree((props: ModalProps) => {
  const { handleClose, handleOpen, contentSx, containerSx } = props;
  const { floating, isOpen, context, nodeId, toggle } = usePopover({
    defaultOpen: true,
    autoUpdate: false,
  });
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

  return (
    <Popover
      nodeId={nodeId}
      context={context}
      isOpen={isOpen}
      order={['floating', 'content']}
    >
      <Flex
        aria-hidden
        elementDescriptor={descriptors.modalBackdrop}
        sx={[
          t => ({
            animation: `${animations.fadeIn} 150ms ${t.transitionTiming.$common}`,
            zIndex: t.zIndices.$modal,
            backgroundColor: t.colors.$modalBackdrop,
            // ...common.centeredFlex(),
            alignItems: 'flex-start',
            justifyContent: 'center',
            overflow: 'auto',
            width: '100vw',
            height: ['100vh', '-webkit-fill-available'],
            position: 'fixed',
            left: 0,
            top: 0,
          }),
          containerSx,
        ]}
      >
        <Flex
          elementDescriptor={descriptors.modalContent}
          ref={floating}
          tabIndex={0}
          aria-modal='true'
          role='dialog'
          sx={[
            t => ({
              position: 'relative',
              outline: 0,
              animation: `${animations.modalSlideAndFade} 180ms ${t.transitionTiming.$easeOut}`,
              margin: `${t.space.$16} 0`,
              [mqu.sm]: {
                margin: `${t.space.$10} 0`,
              },
            }),
            contentSx,
          ]}
        >
          {props.children}
          <IconButton
            elementDescriptor={descriptors.modalCloseButton}
            variant='ghost'
            colorScheme='neutral'
            aria-label='Close modal'
            onClick={toggle}
            icon={
              <Icon
                icon={Close}
                size='sm'
              />
            }
            sx={t => ({
              opacity: t.opacity.$inactive,
              ':hover': {
                opacity: 0.8,
              },
              position: 'absolute',
              top: t.space.$3,
              padding: t.space.$3,
              right: t.space.$3,
            })}
          />
        </Flex>
      </Flex>
    </Popover>
  );
});
