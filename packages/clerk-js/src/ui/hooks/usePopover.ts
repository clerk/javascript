import type { UseFloatingOptions } from '@floating-ui/react';
import { autoUpdate, flip, offset, shift, useDismiss, useFloating, useFloatingNodeId } from '@floating-ui/react';
import React, { useEffect } from 'react';

type UsePopoverProps = {
  defaultOpen?: boolean;
  placement?: UseFloatingOptions['placement'];
  offset?: Parameters<typeof offset>[0];
  shoudFlip?: boolean;
  autoUpdate?: boolean;
  outsidePress?: boolean | ((event: MouseEvent) => boolean);
  bubbles?:
    | boolean
    | {
        escapeKey?: boolean;
        outsidePress?: boolean;
      };
};

export type UsePopoverReturn = ReturnType<typeof usePopover>;

export const usePopover = (props: UsePopoverProps = {}) => {
  const { bubbles = true, shoudFlip = true, outsidePress } = props;
  const [isOpen, setIsOpen] = React.useState(props.defaultOpen || false);
  const nodeId = useFloatingNodeId();
  const { update, refs, strategy, x, y, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    nodeId,
    whileElementsMounted: props.autoUpdate === false ? undefined : autoUpdate,
    placement: props.placement || 'bottom-start',
    middleware: [offset(props.offset || 6), shoudFlip && flip(), shift()],
  });
  // Names are aliased because in @floating-ui/react-dom@2.0.0 the top-level elements were removed
  // This keeps the API shape for consumers of usePopover
  // @see https://github.com/floating-ui/floating-ui/releases/tag/%40floating-ui%2Freact-dom%402.0.0
  const { setReference: reference, setFloating: floating } = refs;

  useDismiss(context, {
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
