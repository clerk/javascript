import {
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  UseFloatingProps,
} from '@floating-ui/react-dom-interactions';
import React from 'react';

type UsePopoverProps = {
  defaultOpen?: boolean;
  placement?: UseFloatingProps['placement'];
  offset?: Parameters<typeof offset>[0];
  autoUpdate?: boolean;
};

export const usePopover = (props: UsePopoverProps = {}) => {
  const [open, setOpen] = React.useState(props.defaultOpen || false);
  const { reference, floating, strategy, x, y, context } = useFloating({
    open,
    onOpenChange: setOpen,
    whileElementsMounted: props.autoUpdate === false ? undefined : autoUpdate,
    placement: props.placement || 'bottom-start',
    middleware: [offset(props.offset || 6), flip(), shift()],
  });
  useDismiss(context);

  const toggle = React.useCallback(() => {
    setOpen(o => !o);
  }, [setOpen]);

  return {
    reference,
    floating,
    toggle,
    isOpen: open,
    styles: { position: strategy, top: y ?? 0, left: x ?? 0 },
    context,
  };
};
