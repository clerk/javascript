import cn from 'classnames';
import React from 'react';

import { useDetectClickOutside, useDomRef } from '../../hooks';
import { noop } from '../../utils';
import { Portal } from '../portal';
import { CloseButton, CloseButtonProps } from './CloseButton';
import { ModalContext } from './context';
// @ts-ignore
import styles from './Modal.module.scss';

// Disables scroll for an element.
// Adds extra padding to prevent layout shifting
// caused by hiding the scrollbar.
function disableScrollHandlers<T extends HTMLElement>(el: T) {
  let oldPaddingRightPx: string;
  let oldOverflow: string;

  const hideScrollbar = () => {
    oldPaddingRightPx = getComputedStyle(el).paddingRight;
    oldOverflow = getComputedStyle(el).overflow;
    const oldWidth = el.clientWidth;
    el.style.overflow = 'hidden';
    const currentWidth = el.clientWidth;
    const oldPaddingRight = Number.parseInt(
      oldPaddingRightPx.replace('px', ''),
    );
    el.style.paddingRight = currentWidth - oldWidth + oldPaddingRight + 'px';
  };

  const revertScrollbar = () => {
    el.style.overflow = oldOverflow;
    if (oldPaddingRightPx) {
      el.style.paddingRight = oldPaddingRightPx;
    }
  };

  return { hideScrollbar, revertScrollbar };
}

export type ModalProps = {
  ref?: React.Ref<ModalElement>;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  active?: boolean;
  rootSelector?: string;
  className?: string;
  triggerClassname?: string;
  modalClassname?: string;
  handleOpen?: () => void;
  handleClose?: () => void;
};

export interface ModalElement {
  open: () => void;
  close: () => void;
}

export type ModalComponent = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<ModalProps> & React.RefAttributes<ModalElement>
> & { CloseButton?: (props: CloseButtonProps) => JSX.Element | null };

const Modal: ModalComponent = React.forwardRef(
  (
    {
      active,
      trigger,
      children,
      rootSelector,
      className,
      triggerClassname,
      modalClassname,
      handleOpen,
      handleClose,
    }: ModalProps,
    ref: React.Ref<ModalElement>,
  ): JSX.Element => {
    const isFirstRun = React.useRef(true);
    const backdropRef = React.useRef<HTMLDivElement | null>(null);
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const backdropDismissTriggerRef = React.useRef<HTMLDivElement | null>(null);
    const rootEl = useDomRef(rootSelector);

    const [isActive, setIsActive] = useDetectClickOutside(
      backdropDismissTriggerRef,
      !!active,
      () => {
        if (typeof handleClose === 'function') {
          handleClose();
        }
      },
    );

    const open = React.useCallback(() => {
      setIsActive(true);
      if (typeof handleOpen === 'function') {
        handleOpen();
      }
    }, [setIsActive, handleOpen]);

    const close = React.useCallback(() => {
      setIsActive(false);
      if (typeof handleClose === 'function') {
        handleClose();
      }
    }, [setIsActive, handleClose]);

    React.useEffect(() => {
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }

      active ? open() : close();
    }, [active]);

    React.useLayoutEffect(() => {
      if (typeof window === 'undefined') {
        return noop;
      }

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') {
          return;
        }
        close();
      };

      const currentRootEl = rootEl.current;
      const { revertScrollbar, hideScrollbar } = disableScrollHandlers(
        document.body,
      );

      if (isActive) {
        window.addEventListener('keydown', onKeyDown);
        currentRootEl?.setAttribute('inert', '');
        currentRootEl?.setAttribute('aria-hidden', '');
        containerRef?.current?.focus();
        hideScrollbar();
      }

      return () => {
        window?.removeEventListener('keydown', onKeyDown);
        currentRootEl?.removeAttribute('inert');
        currentRootEl?.removeAttribute('aria-hidden');
        revertScrollbar();
      };
    }, [isActive, close, rootEl]);

    React.useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    return (
      <>
        {trigger && (
          <div
            className={cn(styles.trigger, triggerClassname)}
            onClick={() => open()}
          >
            {trigger}
          </div>
        )}
        {isActive && (
          <Portal>
            <div
              ref={backdropRef}
              className={cn(styles.backdrop, className)}
              tabIndex={-1}
            >
              <div
                ref={containerRef}
                aria-modal='true'
                role='dialog'
                tabIndex={-1}
                className={cn(styles.container, modalClassname)}
              >
                <ModalContext.Provider value={{ open, close }}>
                  <div
                    className={styles.backdropDismissWrapper}
                    ref={backdropDismissTriggerRef}
                  >
                    {children}
                  </div>
                </ModalContext.Provider>
              </div>
            </div>
          </Portal>
        )}
      </>
    );
  },
);

Modal.displayName = 'Modal';
Modal.CloseButton = CloseButton;

export { Modal };
