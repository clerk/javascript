import { createContextAndHook, useSafeLayoutEffect } from '@clerk/shared';
import React, { useRef } from 'react';

import { descriptors, Flex } from '../customizables';
import { usePopover, useScrollLock } from '../hooks';
import type { ThemableCssProp } from '../styledSystem';
import { animations, mqu } from '../styledSystem';
import { withFloatingTree } from './contexts';
import { Popover } from './Popover';

export const [ModalContext, _, useUnsafeModalContext] = createContextAndHook<{ toggle: () => void }>('ModalContext');

type ModalProps = React.PropsWithChildren<{
  handleOpen?: () => void;
  handleClose?: () => void;
  contentSx?: ThemableCssProp;
  containerSx?: ThemableCssProp;
}>;

export const Modal = withFloatingTree((props: ModalProps) => {
  const { handleClose, handleOpen, contentSx, containerSx } = props;
  const { disableScroll, enableScroll } = useScrollLock(document.body);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { floating, isOpen, context, nodeId, toggle } = usePopover({
    defaultOpen: true,
    autoUpdate: false,
    outsidePress: e => e.target === overlayRef.current,
  });

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

  const modalCtx = React.useMemo(() => ({ value: { toggle } }), [toggle]);

  return (
    <Popover
      nodeId={nodeId}
      context={context}
      isOpen={isOpen}
      order={['floating', 'content']}
    >
      <ModalContext.Provider value={modalCtx}>
        <Flex
          aria-hidden
          ref={overlayRef}
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
          </Flex>
        </Flex>
      </ModalContext.Provider>
    </Popover>
  );
});
