import { autoUpdate, flip, offset, shift, useDismiss, useFloating } from '@floating-ui/react-dom-interactions';
import React from 'react';

type UsePopoverProps = {
  defaultOpen?: boolean;
};

export const usePopover = (props: UsePopoverProps = {}) => {
  const [open, setOpen] = React.useState(props.defaultOpen || false);
  const { reference, floating, strategy, x, y, context } = useFloating({
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
    middleware: [offset(6), flip(), shift()],
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
