import type { Placement, UseFloatingReturn, UseInteractionsReturn } from '@floating-ui/react';
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

import { usePortalRoot } from '@clerk/shared/react';

import { Box, descriptors, type LocalizationKey, Span, Text, useAppearance } from '../customizables';
import { usePrefersReducedMotion } from '../hooks';
import type { ThemableCssProp } from '../styledSystem';

interface TooltipOptions {
  initialOpen?: boolean;
  placement?: Placement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface UseTooltipReturn extends UseFloatingReturn, UseInteractionsReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  isMounted: boolean;
  transitionStyles: React.CSSProperties;
}

export function useTooltip({
  initialOpen = false,
  placement = 'top',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: TooltipOptions = {}): UseTooltipReturn {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const prefersReducedMotion = usePrefersReducedMotion();
  const { animations: layoutAnimations } = useAppearance().parsedOptions;
  const isMotionSafe = !prefersReducedMotion && layoutAnimations === true;

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
    duration: isMotionSafe ? 200 : 0,
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

type ContextType = UseTooltipReturn | null;

const TooltipContext = React.createContext<ContextType>(null);

export const useTooltipContext = (): UseTooltipReturn => {
  const context = React.useContext(TooltipContext);

  if (context == null) {
    throw new Error('Tooltip components must be wrapped in <Tooltip />');
  }

  return context;
};

function Root({ children, ...options }: { children: React.ReactNode } & TooltipOptions) {
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const tooltip = useTooltip(options);
  return <TooltipContext.Provider value={tooltip}>{children}</TooltipContext.Provider>;
}

type TriggerProps = React.HTMLProps<HTMLElement> & {
  sx?: ThemableCssProp;
};

const Trigger = React.forwardRef<HTMLElement, TriggerProps>(function TooltipTrigger(
  { children, sx, ...props },
  propRef,
) {
  const context = useTooltipContext();
  const childrenRef = (children as any).ref;
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

  if (!React.isValidElement(children)) {
    return null;
  }

  // If the child is disabled, wrap it in a span to handle focus events
  if (children.props.isDisabled || children.props.disabled) {
    return (
      <Span
        ref={ref}
        {...context.getReferenceProps({
          ...props,
        })}
        data-state={context.open ? 'open' : 'closed'}
        sx={[
          {
            width: 'fit-content',
            display: 'inline-block',
            cursor: 'not-allowed',
            outline: 'none',
          },
          sx,
        ]}
        tabIndex={0}
      >
        {children}
      </Span>
    );
  }

  return React.cloneElement(
    children,
    context.getReferenceProps({
      ref,
      ...props,
      ...children.props,
      'data-state': context.open ? 'open' : 'closed',
    }),
  );
});

const Content = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement> & {
    text: string | LocalizationKey;
    sx?: ThemableCssProp;
  }
>(function TooltipContent({ style, text, sx, ...props }, propRef) {
  const context = useTooltipContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);
  const portalRoot = usePortalRoot();
  const effectiveRoot = portalRoot?.() ?? undefined;

  if (!context.isMounted) {
    return null;
  }

  return (
    <FloatingPortal root={effectiveRoot}>
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
          sx={[
            t => ({
              paddingBlock: t.space.$1,
              paddingInline: t.space.$1x5,
              borderRadius: t.radii.$md,
              backgroundColor: t.colors.$black,
              color: t.colors.$white,
              maxWidth: t.sizes.$60,
            }),
            sx,
          ]}
        >
          <Text
            elementDescriptor={descriptors.tooltipText}
            localizationKey={text}
            variant='body'
            colorScheme='inherit'
          />
        </Box>
      </Box>
    </FloatingPortal>
  );
});

export const Tooltip = {
  Root,
  Trigger,
  Content,
};
