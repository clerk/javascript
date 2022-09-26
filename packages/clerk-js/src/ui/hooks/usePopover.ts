import {
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  UseFloatingProps,
} from '@floating-ui/react-dom-interactions';
import React, { useEffect } from 'react';

type UsePopoverProps = {
  defaultOpen?: boolean;
  placement?: UseFloatingProps['placement'];
  offset?: Parameters<typeof offset>[0];
  autoUpdate?: boolean;
};

export const usePopover = (props: UsePopoverProps = {}) => {
  const [isOpen, setIsOpen] = React.useState(props.defaultOpen || false);
  const { update, reference, floating, strategy, x, y, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: props.autoUpdate === false ? undefined : autoUpdate,
    placement: props.placement || 'bottom-start',
    middleware: [offset(props.offset || 6), flip(), shift()],
  });

  useEffect(() => {
    setIsOpen(props.defaultOpen || false);
  }, [props.defaultOpen]);

  useEffect(() => {
    update();
  }, []); // this is due to a positioning bug on render

  useDismiss(context);

  const toggle = React.useCallback(() => setIsOpen(o => !o), [setIsOpen]);
  const open = React.useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = React.useCallback(() => setIsOpen(false), [setIsOpen]);

  return {
    reference,
    floating,
    toggle,
    open,
    close,
    isOpen,
    styles: { position: strategy, top: y ?? 0, left: x ?? 0 },
    context,
  };
};
