import type { Placement } from '@floating-ui/react';
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import * as React from 'react';

import { Box, descriptors } from '../customizables';

interface TooltipOptions {
  initialOpen?: boolean;
  placement?: Placement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useTooltip({
  initialOpen = false,
  placement = 'top',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: TooltipOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({
        crossAxis: placement.includes('-'),
        fallbackAxisSideDirection: 'start',
        padding: 6,
      }),
      shift({ padding: 6 }),
    ],
  });

  const context = data.context;

  const hover = useHover(context, {
    move: false,
    enabled: controlledOpen == null,
  });
  const focus = useFocus(context, {
    enabled: controlledOpen == null,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 200,
    initial: ({ side }) => {
      return {
        opacity: 0,
        transform: side === 'top' ? 'translateY(4px)' : 'translateY(-4px)',
      };
    },
    open: {
      opacity: 1,
      transform: 'translate(0)',
    },
    close: ({ side }) => ({
      opacity: 0,
      transform: side === 'top' ? 'translateY(4px)' : 'translateY(-4px)',
    }),
  });

  const interactions = useInteractions([hover, focus, dismiss, role]);

  return React.useMemo(
    () => ({
      open,
      setOpen,
      isMounted,
      ...interactions,
      ...data,
      transitionStyles,
    }),
    [open, setOpen, interactions, data, isMounted, transitionStyles],
  );
}

type ContextType = ReturnType<typeof useTooltip> | null;

const TooltipContext = React.createContext<ContextType>(null);

export const useTooltipContext = () => {
  const context = React.useContext(TooltipContext);

  if (context == null) {
    throw new Error('Tooltip components must be wrapped in <Tooltip />');
  }

  return context;
};

export function Tooltip({ children, ...options }: { children: React.ReactNode } & TooltipOptions) {
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const tooltip = useTooltip(options);
  return <TooltipContext.Provider value={tooltip}>{children}</TooltipContext.Provider>;
}

export const TooltipTrigger = React.forwardRef<HTMLElement, React.HTMLProps<HTMLElement>>(function TooltipTrigger(
  { children, ...props },
  propRef,
) {
  const context = useTooltipContext();
  const childrenRef = (children as any).ref;
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

  if (React.isValidElement(children)) {
    return React.cloneElement(
      children,
      context.getReferenceProps({
        ref,
        ...props,
        ...children.props,
        'data-tooltip-state': context.open ? 'open' : 'closed',
      }),
    );
  }

  return null;
});

export const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(function TooltipContent(
  { style, ...props },
  propRef,
) {
  const context = useTooltipContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  if (!context.isMounted) return null;

  return (
    <FloatingPortal>
      <Box
        ref={ref}
        elementDescriptor={descriptors.tooltip}
        style={{
          ...context.floatingStyles,
          ...style,
        }}
        {...context.getFloatingProps(props)}
      >
        <Box
          elementDescriptor={descriptors.tooltipContent}
          style={context.transitionStyles}
          sx={t => ({
            paddingBlock: t.space.$0x5,
            paddingInline: t.space.$1x5,
            borderRadius: t.radii.$md,
            fontSize: t.fontSizes.$sm,
            backgroundColor: t.colors.$primary500,
            color: t.colors.$colorTextOnPrimaryBackground,
            maxWidth: t.sizes.$60,
          })}
        >
          {props.children}
        </Box>
      </Box>
    </FloatingPortal>
  );
});
