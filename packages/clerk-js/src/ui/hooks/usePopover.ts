import type { UseFloatingOptions } from '@floating-ui/react';
import { autoUpdate, flip, offset, shift, size, useDismiss, useFloating, useFloatingNodeId } from '@floating-ui/react';
import React, { useEffect } from 'react';

type UsePopoverProps = {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChanged?: (open: boolean | ((prevState: boolean) => boolean)) => void;
  placement?: UseFloatingOptions['placement'];
  offset?: Parameters<typeof offset>[0];
  shoudFlip?: boolean;
  autoUpdate?: boolean;
  outsidePress?: boolean | ((event: MouseEvent) => boolean);
  adjustToReferenceWidth?: boolean;
  referenceElement?: React.RefObject<HTMLElement> | null;
  bubbles?:
    | boolean
    | {
        escapeKey?: boolean;
        outsidePress?: boolean;
      };
};

export type UsePopoverReturn = ReturnType<typeof usePopover>;

export const usePopover = (props: UsePopoverProps = {}) => {
  const { bubbles = true, shoudFlip = true, outsidePress, adjustToReferenceWidth = false, referenceElement } = props;
  const [isOpen_internal, setIsOpen_internal] = React.useState(props.defaultOpen || false);

  const isOpen = typeof props.open === 'undefined' ? isOpen_internal : props.open;
  const setIsOpen = typeof props.onOpenChanged === 'undefined' ? setIsOpen_internal : props.onOpenChanged;
  const nodeId = useFloatingNodeId();

  if (typeof props.defaultOpen !== 'undefined' && typeof props.open !== 'undefined') {
    console.warn('Both defaultOpen and open are set. `defaultOpen` will be ignored');
  }

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
  // Names are aliased because in @floating-ui/react-dom@2.0.0 the top-level elements were removed
  // This keeps the API shape for consumers of usePopover
  // @see https://github.com/floating-ui/floating-ui/releases/tag/%40floating-ui%2Freact-dom%402.0.0
  const { setReference: reference, setFloating: floating } = refs;

  useDismiss(context, {
    bubbles,
    outsidePress,
    //outsidePress: typeof props.open === 'undefined' ? outsidePress : false,
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
    reference,
    floating,
    toggle,
    open,
    nodeId,
    close,
    isOpen,
    styles: { position: strategy, top: y ?? 0, left: x ?? 0 },
    context,
  };
};
