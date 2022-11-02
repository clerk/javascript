import {
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  UseFloatingProps,
} from '@floating-ui/react-dom-interactions';
import React, { useEffect } from 'react';

type UsePopoverProps = {
  defaultOpen?: boolean;
  placement?: UseFloatingProps['placement'];
  offset?: Parameters<typeof offset>[0];
  autoUpdate?: boolean;
  bubbles?: boolean;
};

export type UsePopoverReturn = ReturnType<typeof usePopover>;

export const usePopover = (props: UsePopoverProps = {}) => {
  const { bubbles = true } = props;
  const [isOpen, setIsOpen] = React.useState(props.defaultOpen || false);
  const nodeId = useFloatingNodeId();
  const { update, reference, floating, strategy, x, y, context, refs } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    nodeId,
    whileElementsMounted: props.autoUpdate === false ? undefined : autoUpdate,
    placement: props.placement || 'bottom-start',
    middleware: [offset(props.offset || 6), flip(), shift()],
  });

  useDismiss(context, { bubbles });

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      if (!e.relatedTarget) {
        (refs.floating.current as HTMLElement | null)?.focus();
      }
    };

    if (!bubbles) {
      window.addEventListener('focusout', handleFocus);
    }

    return () => {
      if (!bubbles) {
        window.removeEventListener('focusout', handleFocus);
      }
    };
  }, [bubbles]);

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
