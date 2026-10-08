import type React from 'react';
import { useCallback, useId, useRef } from 'react';

import type { UsePopoverReturn } from './usePopover';
import { usePopover } from './usePopover';

export type FloatingMenuController = Pick<UsePopoverReturn, 'reference' | 'isOpen' | 'nodeId' | 'context'> & {
  popoverRef: React.RefObject<HTMLElement | null>;
  triggerProps: ReturnType<UsePopoverReturn['getReferenceProps']>;
  popoverProps: ReturnType<UsePopoverReturn['getFloatingProps']>;
  close: () => void;
};

export const useFloatingMenuController = ({
  defaultOpen,
  placement,
}: {
  defaultOpen?: boolean;
  placement: 'bottom-start' | 'bottom-end';
}): FloatingMenuController => {
  const { floating, reference, styles, close, isOpen, nodeId, context, getReferenceProps, getFloatingProps } =
    usePopover({
      defaultOpen,
      placement,
      offset: 8,
    });

  const menuId = useId();
  const popoverRef = useRef<HTMLElement | null>(null);
  const floatingRef = useCallback(
    (node: HTMLElement | null) => {
      floating(node);
      popoverRef.current = node;
    },
    [floating],
  );

  return {
    reference,
    isOpen,
    nodeId,
    context,
    popoverRef,
    triggerProps: getReferenceProps({
      'aria-controls': isOpen ? menuId : undefined,
    }),
    popoverProps: getFloatingProps({
      id: menuId,
      tabIndex: -1,
      ref: floatingRef,
      style: styles,
    }),
    close,
  };
};
