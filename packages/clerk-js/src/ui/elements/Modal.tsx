import { createContextAndHook } from '@clerk/shared/react';
import { FloatingOverlay } from '@floating-ui/react';
import React, { useRef } from 'react';

import { descriptors, Flex } from '../customizables';
import { usePopover } from '../hooks';
import type { ThemableCssProp } from '../styledSystem';
import { animations, mqu } from '../styledSystem';
import { withFloatingTree } from './contexts';
import { Popover } from './Popover';

export const [ModalContext, _, useUnsafeModalContext] = createContextAndHook<{ toggle?: () => void }>('ModalContext');

type ModalProps = React.PropsWithChildren<{
  id?: string;
  handleOpen?: () => void;
  handleClose?: () => void;
  contentSx?: ThemableCssProp;
  containerSx?: ThemableCssProp;
  /**
   * Controls whether the modal can be closed through user interactions:
   * - Pressing the escape key
   * - Clicking outside the modal
   * - Clicking the close button (which is hidden when this is false)
   * @default true
   */
  canCloseModal?: boolean;
  /**
   * Controls whether clicking outside the modal will close it.
   * When true, clicking on the overlay/backdrop element will close the modal.
   * When false, clicking outside will not close the modal.
   * @default false
   */
  onClickOutsideDisabled?: boolean;
  style?: React.CSSProperties;
}>;

export const Modal = withFloatingTree((props: ModalProps) => {
  const {
    handleClose,
    handleOpen,
    contentSx,
    containerSx,
    canCloseModal,
    onClickOutsideDisabled = false,
    id,
    style,
  } = props;
  const overlayRef = useRef<HTMLDivElement>(null);
  const { floating, isOpen, context, nodeId, toggle } = usePopover({
    defaultOpen: true,
    autoUpdate: false,
    outsidePress: onClickOutsideDisabled === true ? false : e => e.target === overlayRef.current,
    canCloseModal,
  });

  React.useEffect(() => {
    if (!isOpen) {
      handleClose?.();
    } else {
      handleOpen?.();
    }
  }, [isOpen]);

  const modalCtx = React.useMemo(() => ({ value: canCloseModal === false ? {} : { toggle } }), [toggle, canCloseModal]);

  return (
    <Popover
      nodeId={nodeId}
      context={context}
      isOpen={isOpen}
    >
      <FloatingOverlay lockScroll>
        <ModalContext.Provider value={modalCtx}>
          <Flex
            id={id}
            ref={overlayRef}
            elementDescriptor={descriptors.modalBackdrop}
            style={style}
            sx={[
              t => ({
                animation: `${animations.fadeIn} 150ms ${t.transitionTiming.$common}`,
                zIndex: t.zIndices.$modal,
                backgroundColor: t.colors.$modalBackdrop,
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
      </FloatingOverlay>
    </Popover>
  );
});
