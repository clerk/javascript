'use client';

import {
  arrow,
  autoUpdate,
  type ExtendedRefs,
  FloatingArrow,
  type FloatingContext,
  FloatingFocusManager,
  FloatingNode,
  FloatingPortal,
  FloatingTree,
  flip,
  offset,
  type Placement,
  type ReferenceType,
  shift,
  type UseInteractionsReturn,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { type TransitionProps, useFloatingTransition } from '../../hooks/use-floating-transition';
import { floatingCssVars } from '../../utils/floating-css-vars';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  floatingContext: FloatingContext;
  refs: ExtendedRefs<ReferenceType>;
  floatingStyles: CSSProperties;
  placement: Placement;
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  popupRef: React.RefObject<HTMLDivElement | null>;
  arrowRef: React.MutableRefObject<SVGSVGElement | null>;
  modal: boolean;
  labelId: string | undefined;
  descriptionId: string | undefined;
  setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
  mounted: boolean;
  transitionProps: TransitionProps;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const ctx = useContext(PopoverContext);
  if (!ctx) {
    throw new Error('Popover compound components must be used within <Popover>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Popover (root)
// ---------------------------------------------------------------------------

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  sideOffset?: number;
  modal?: boolean;
  children: ReactNode;
}

function PopoverInner(props: PopoverProps) {
  const nodeId = useFloatingNodeId();
  const { placement: placementProp = 'bottom', sideOffset = 4, modal = false, children } = props;

  const [open, setOpen] = useControllableState(props.open, props.defaultOpen ?? false, props.onOpenChange);

  const [labelId, setLabelId] = useState<string | undefined>();
  const [descriptionId, setDescriptionId] = useState<string | undefined>();

  const arrowRef = useRef<SVGSVGElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const {
    refs,
    floatingStyles,
    context: floatingContext,
    placement,
  } = useFloating({
    nodeId,
    open,
    onOpenChange: setOpen,
    placement: placementProp,
    middleware: [
      offset(sideOffset),
      flip({
        crossAxis: placementProp.includes('-'),
        fallbackAxisSideDirection: 'end',
        padding: 5,
      }),
      shift({ padding: 5 }),
      arrow({ element: arrowRef }),
      floatingCssVars({ sideOffset }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { mounted, transitionProps } = useFloatingTransition({
    open,
    ref: popupRef,
  });

  const click = useClick(floatingContext);
  const dismiss = useDismiss(floatingContext);
  const role = useRole(floatingContext);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const contextValue = useMemo<PopoverContextValue>(
    () => ({
      open,
      setOpen,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getReferenceProps,
      getFloatingProps,
      popupRef,
      arrowRef,
      modal,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId,
      mounted,
      transitionProps,
    }),
    [
      open,
      setOpen,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getReferenceProps,
      getFloatingProps,
      modal,
      labelId,
      descriptionId,
      mounted,
      transitionProps,
    ],
  );

  return (
    <FloatingNode id={nodeId}>
      <PopoverContext.Provider value={contextValue}>{children}</PopoverContext.Provider>
    </FloatingNode>
  );
}

function PopoverRoot(props: PopoverProps) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <PopoverInner {...props} />
      </FloatingTree>
    );
  }

  return <PopoverInner {...props} />;
}

// ---------------------------------------------------------------------------
// Popover.Trigger
// ---------------------------------------------------------------------------

export interface PopoverTriggerProps extends ComponentProps<'button'> {}

function PopoverTrigger(props: PopoverTriggerProps) {
  const { render, ...otherProps } = props;
  const { open, refs, getReferenceProps } = usePopoverContext();

  const state = { open };

  const defaultProps = {
    type: 'button' as const,
    'data-cl-slot': 'popover-trigger',
    ref: refs.setReference,
    ...(getReferenceProps() as React.ComponentPropsWithRef<'button'>),
  };

  return renderElement({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Popover.Portal
// ---------------------------------------------------------------------------

export interface PopoverPortalProps {
  children: ReactNode;
}

function PopoverPortal(props: PopoverPortalProps) {
  const { mounted } = usePopoverContext();
  if (!mounted) return null;
  return <FloatingPortal>{props.children}</FloatingPortal>;
}

// ---------------------------------------------------------------------------
// Popover.Positioner
// ---------------------------------------------------------------------------

export interface PopoverPositionerProps extends ComponentProps<'div'> {}

function PopoverPositioner(props: PopoverPositionerProps) {
  const { render, ...otherProps } = props;
  const { mounted, floatingContext, refs, floatingStyles, placement, getFloatingProps, modal, labelId, descriptionId } =
    usePopoverContext();

  const side = placement.split('-')[0];

  const defaultProps = {
    'data-cl-slot': 'popover-positioner',
    'data-cl-side': side,
    ref: refs.setFloating,
    style: floatingStyles,
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
    ...(getFloatingProps() as React.ComponentPropsWithRef<'div'>),
  };

  const element = renderElement({
    defaultTagName: 'div',
    render,
    enabled: mounted,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });

  return (
    <FloatingFocusManager
      context={floatingContext}
      modal={modal}
    >
      {element!}
    </FloatingFocusManager>
  );
}

// ---------------------------------------------------------------------------
// Popover.Popup
// ---------------------------------------------------------------------------

export interface PopoverPopupProps extends ComponentProps<'div'> {}

function PopoverPopup(props: PopoverPopupProps) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = usePopoverContext();

  const defaultProps = {
    'data-cl-slot': 'popover-popup',
    ref: popupRef,
    ...transitionProps,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Popover.Arrow
// ---------------------------------------------------------------------------

export interface PopoverArrowProps extends React.ComponentPropsWithRef<typeof FloatingArrow> {}

function PopoverArrowComponent(props: PopoverArrowProps) {
  const { floatingContext, arrowRef, placement } = usePopoverContext();
  const side = placement.split('-')[0];

  return (
    <FloatingArrow
      data-cl-slot='popover-arrow'
      data-cl-side={side}
      {...props}
      ref={arrowRef}
      context={floatingContext}
    />
  );
}

// ---------------------------------------------------------------------------
// Popover.Title
// ---------------------------------------------------------------------------

export interface PopoverTitleProps extends ComponentProps<'h2'> {}

function PopoverTitle(props: PopoverTitleProps) {
  const { render, ...otherProps } = props;
  const { setLabelId } = usePopoverContext();
  const id = useId();

  useLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  const defaultProps = {
    'data-cl-slot': 'popover-title',
    id,
  };

  return renderElement({
    defaultTagName: 'h2',
    render,
    props: mergeProps<'h2'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Popover.Description
// ---------------------------------------------------------------------------

export interface PopoverDescriptionProps extends ComponentProps<'p'> {}

function PopoverDescription(props: PopoverDescriptionProps) {
  const { render, ...otherProps } = props;
  const { setDescriptionId } = usePopoverContext();
  const id = useId();

  useLayoutEffect(() => {
    setDescriptionId(id);
    return () => setDescriptionId(undefined);
  }, [id, setDescriptionId]);

  const defaultProps = {
    'data-cl-slot': 'popover-description',
    id,
  };

  return renderElement({
    defaultTagName: 'p',
    render,
    props: mergeProps<'p'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Popover.Close
// ---------------------------------------------------------------------------

export interface PopoverCloseProps extends ComponentProps<'button'> {}

function PopoverClose(props: PopoverCloseProps) {
  const { render, ...otherProps } = props;
  const { setOpen } = usePopoverContext();

  const defaultProps = {
    type: 'button' as const,
    'data-cl-slot': 'popover-close',
    onClick() {
      setOpen(false);
    },
  };

  return renderElement({
    defaultTagName: 'button',
    render,
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Portal: PopoverPortal,
  Positioner: PopoverPositioner,
  Popup: PopoverPopup,
  Arrow: PopoverArrowComponent,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverClose,
});
