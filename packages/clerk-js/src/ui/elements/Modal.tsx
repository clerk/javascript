import { createContextAndHook, useSafeLayoutEffect } from '@clerk/shared/react';
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
  canCloseModal?: boolean;
  style?: React.CSSProperties;
}>;

let cleanup = () => {};
let lockCount = 0;

export const Modal = withFloatingTree((props: ModalProps) => {
  const { handleClose, handleOpen, contentSx, containerSx, canCloseModal, id, style } = props;
  const overlayRef = useRef<HTMLDivElement>(null);
  const { floating, isOpen, context, nodeId, toggle } = usePopover({
    defaultOpen: true,
    autoUpdate: false,
    outsidePress: e => e.target === overlayRef.current,
    canCloseModal,
  });

  React.useEffect(() => {
    if (!isOpen) {
      handleClose?.();
    } else {
      handleOpen?.();
    }
  }, [isOpen]);

  useSafeLayoutEffect(() => {
    lockCount++;

    if (lockCount === 1) {
      cleanup = enableScrollLock();
    }

    return () => {
      lockCount--;
      if (lockCount === 0) {
        cleanup();
      }
    };
  });

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

interface NavigatorUAData {
  brands: Array<{ brand: string; version: string }>;
  mobile: boolean;
  platform: string;
}

// Avoid Chrome DevTools blue warning.
export function getPlatform(): string {
  const uaData = (navigator as any).userAgentData as NavigatorUAData | undefined;

  if (uaData?.platform) {
    return uaData.platform;
  }

  return navigator.platform;
}

function enableScrollLock() {
  const isIOS = /iP(hone|ad|od)|iOS/.test(getPlatform());
  const bodyStyle = document.body.style;
  // RTL <body> scrollbar
  const scrollbarX =
    Math.round(document.documentElement.getBoundingClientRect().left) + document.documentElement.scrollLeft;
  const paddingProp = scrollbarX ? 'paddingLeft' : 'paddingRight';
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  const scrollX = bodyStyle.left ? parseFloat(bodyStyle.left) : window.scrollX;
  const scrollY = bodyStyle.top ? parseFloat(bodyStyle.top) : window.scrollY;

  bodyStyle.overflow = 'hidden';

  if (scrollbarWidth) {
    bodyStyle[paddingProp] = `${scrollbarWidth}px`;
  }

  // Only iOS doesn't respect `overflow: hidden` on document.body, and this
  // technique has fewer side effects.
  if (isIOS) {
    // iOS 12 does not support `visualViewport`.
    const offsetLeft = window.visualViewport?.offsetLeft || 0;
    const offsetTop = window.visualViewport?.offsetTop || 0;

    Object.assign(bodyStyle, {
      position: 'fixed',
      top: `${-(scrollY - Math.floor(offsetTop))}px`,
      left: `${-(scrollX - Math.floor(offsetLeft))}px`,
      right: '0',
    });
  }

  return () => {
    Object.assign(bodyStyle, {
      overflow: '',
      [paddingProp]: '',
    });

    if (isIOS) {
      Object.assign(bodyStyle, {
        position: '',
        top: '',
        left: '',
        right: '',
      });
      window.scrollTo(scrollX, scrollY);
    }
  };
}
