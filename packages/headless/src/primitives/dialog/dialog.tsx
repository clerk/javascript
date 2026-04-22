'use client';

import {
  type ExtendedRefs,
  type FloatingContext,
  FloatingFocusManager,
  FloatingNode,
  FloatingOverlay,
  FloatingPortal,
  FloatingTree,
  type ReferenceType,
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
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { type TransitionProps, useFloatingTransition } from '../../hooks/use-floating-transition';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  floatingContext: FloatingContext;
  refs: ExtendedRefs<ReferenceType>;
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  popupRef: React.RefObject<HTMLDivElement | null>;
  modal: boolean;
  labelId: string | undefined;
  descriptionId: string | undefined;
  setLabelId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setDescriptionId: React.Dispatch<React.SetStateAction<string | undefined>>;
  mounted: boolean;
  transitionProps: TransitionProps;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('Dialog compound components must be used within <Dialog>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Dialog (root)
// ---------------------------------------------------------------------------

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true, the dialog traps focus and blocks interaction with the rest of the page. Default: true */
  modal?: boolean;
  children: ReactNode;
}

function DialogInner(props: DialogProps) {
  const nodeId = useFloatingNodeId();
  const { modal = true, children } = props;

  const [open, setOpen] = useControllableState(props.open, props.defaultOpen ?? false, props.onOpenChange);

  const [labelId, setLabelId] = useState<string | undefined>();
  const [descriptionId, setDescriptionId] = useState<string | undefined>();

  const popupRef = useRef<HTMLDivElement | null>(null);

  const { refs, context: floatingContext } = useFloating({
    nodeId,
    open,
    onOpenChange: setOpen,
  });

  const { mounted, transitionProps } = useFloatingTransition({
    open,
    ref: popupRef,
  });

  const click = useClick(floatingContext);
  const dismiss = useDismiss(floatingContext, {
    outsidePressEvent: 'mousedown',
  });
  const role = useRole(floatingContext);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const contextValue = useMemo<DialogContextValue>(
    () => ({
      open,
      setOpen,
      floatingContext,
      refs,
      getReferenceProps,
      getFloatingProps,
      popupRef,
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
      <DialogContext.Provider value={contextValue}>{children}</DialogContext.Provider>
    </FloatingNode>
  );
}

function DialogRoot(props: DialogProps) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <DialogInner {...props} />
      </FloatingTree>
    );
  }

  return <DialogInner {...props} />;
}

// ---------------------------------------------------------------------------
// Dialog.Trigger
// ---------------------------------------------------------------------------

export interface DialogTriggerProps extends ComponentProps<'button'> {}

function DialogTrigger(props: DialogTriggerProps) {
  const { render, ...otherProps } = props;
  const { open, refs, getReferenceProps } = useDialogContext();

  const state = { open };

  const defaultProps = {
    type: 'button' as const,
    'data-cl-slot': 'dialog-trigger',
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
// Dialog.Portal
// ---------------------------------------------------------------------------

export interface DialogPortalProps {
  children: ReactNode;
}

function DialogPortal(props: DialogPortalProps) {
  const { mounted } = useDialogContext();

  if (!mounted) return null;

  return <FloatingPortal>{props.children}</FloatingPortal>;
}

// ---------------------------------------------------------------------------
// Dialog.Backdrop
// ---------------------------------------------------------------------------

export interface DialogBackdropProps extends ComponentProps<'div'> {
  /** When true, locks body scroll while the dialog is open. Default: true */
  lockScroll?: boolean;
}

function DialogBackdrop(props: DialogBackdropProps) {
  const { render, lockScroll = true, ...otherProps } = props;
  const { open, mounted, transitionProps } = useDialogContext();

  const state = { open };

  const defaultProps = {
    'data-cl-slot': 'dialog-backdrop',
    ...transitionProps,
  } as React.ComponentPropsWithRef<'div'>;

  const backdropElement = renderElement({
    defaultTagName: 'div',
    render,
    enabled: mounted,
    state,
    stateAttributesMapping: {
      open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
    },
    props: mergeProps<'div'>(defaultProps, otherProps),
  });

  return <FloatingOverlay lockScroll={lockScroll}>{backdropElement}</FloatingOverlay>;
}

// ---------------------------------------------------------------------------
// Dialog.Popup
// ---------------------------------------------------------------------------

export interface DialogPopupProps extends ComponentProps<'div'> {}

function DialogPopup(props: DialogPopupProps) {
  const { render, ...otherProps } = props;
  const { popupRef, refs, getFloatingProps, floatingContext, modal, labelId, descriptionId, transitionProps } =
    useDialogContext();

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      (popupRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      refs.setFloating(node);
    },
    [popupRef, refs],
  );

  const defaultProps = {
    'data-cl-slot': 'dialog-popup',
    ref: combinedRef,
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
    ...(getFloatingProps() as React.ComponentPropsWithRef<'div'>),
    ...transitionProps,
  };

  return (
    <FloatingFocusManager
      context={floatingContext}
      modal={modal}
    >
      {renderElement({
        defaultTagName: 'div',
        render,
        props: mergeProps<'div'>(defaultProps, otherProps),
      })}
    </FloatingFocusManager>
  );
}

// ---------------------------------------------------------------------------
// Dialog.Title
// ---------------------------------------------------------------------------

export interface DialogTitleProps extends ComponentProps<'h2'> {}

function DialogTitle(props: DialogTitleProps) {
  const { render, ...otherProps } = props;
  const { setLabelId } = useDialogContext();
  const id = useId();

  useLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  const defaultProps = {
    'data-cl-slot': 'dialog-title',
    id,
  };

  return renderElement({
    defaultTagName: 'h2',
    render,
    props: mergeProps<'h2'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Dialog.Description
// ---------------------------------------------------------------------------

export interface DialogDescriptionProps extends ComponentProps<'p'> {}

function DialogDescription(props: DialogDescriptionProps) {
  const { render, ...otherProps } = props;
  const { setDescriptionId } = useDialogContext();
  const id = useId();

  useLayoutEffect(() => {
    setDescriptionId(id);
    return () => setDescriptionId(undefined);
  }, [id, setDescriptionId]);

  const defaultProps = {
    'data-cl-slot': 'dialog-description',
    id,
  };

  return renderElement({
    defaultTagName: 'p',
    render,
    props: mergeProps<'p'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Dialog.Close
// ---------------------------------------------------------------------------

export interface DialogCloseProps extends ComponentProps<'button'> {}

function DialogClose(props: DialogCloseProps) {
  const { render, ...otherProps } = props;
  const { setOpen } = useDialogContext();

  const defaultProps = {
    type: 'button' as const,
    'data-cl-slot': 'dialog-close',
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

export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Backdrop: DialogBackdrop,
  Popup: DialogPopup,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
});
