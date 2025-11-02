import type { UseFloatingOptions } from '@floating-ui/react';
import { autoUpdate, flip, offset, shift, size, useDismiss, useFloating, useFloatingNodeId } from '@floating-ui/react';
import React, { useEffect } from 'react';

type UsePopoverProps = {
  defaultOpen?: boolean;
  placement?: UseFloatingOptions['placement'];
  offset?: Parameters<typeof offset>[0];
  shoudFlip?: boolean;
  autoUpdate?: boolean;
  outsidePress?: boolean | ((event: MouseEvent) => boolean);
  adjustToReferenceWidth?: boolean;
  referenceElement?: React.RefObject<HTMLElement> | null;
  canCloseModal?: boolean;
  bubbles?:
    | boolean
    | {
        escapeKey?: boolean;
        outsidePress?: boolean;
      };
};

export type UsePopoverReturn = ReturnType<typeof usePopover>;

export const usePopover = (props: UsePopoverProps = {}) => {
  const {
    bubbles = false,
    shoudFlip = true,
    outsidePress,
    adjustToReferenceWidth = false,
    referenceElement,
    canCloseModal,
  } = props;
  const [isOpen, setIsOpen] = React.useState(props.defaultOpen || false);
  const nodeId = useFloatingNodeId();
  const { update, refs, strategy, x, y, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    elements: {
      reference: referenceElement?.current,
    },
    nodeId,
    whileElementsMounted: props.autoUpdate === false ? undefined : autoUpdate,
    placement: props.placement || 'bottom-start',
    middleware: [
      offset(props.offset || 6),
      shoudFlip && flip(),
      shift(),
      size({
        apply({ elements }) {
          if (adjustToReferenceWidth) {
            const reference = elements.reference as any as HTMLElement;
            elements.floating.style.width = reference ? `${reference?.offsetWidth}px` : '';
          }
        },
      }),
    ],
  });

  useDismiss(context, {
    enabled: canCloseModal !== false,
    bubbles,
    outsidePress,
  });

  useEffect(() => {
    if (props.defaultOpen) {
      update();
    }
  }, []);

  const toggle = React.useCallback(() => setIsOpen(o => !o), [setIsOpen]);
  const open = React.useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = React.useCallback(() => setIsOpen(false), [setIsOpen]);

  return {
    reference: refs.setReference,
    floating: refs.setFloating,
    toggle,
    open,
    nodeId,
    close,
    isOpen,
    styles: { position: strategy, top: y ?? 0, left: x ?? 0 },
    context,
  };
};
