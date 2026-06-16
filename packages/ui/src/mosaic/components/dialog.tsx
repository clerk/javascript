import React from 'react';

import { useMosaicTheme } from '../MosaicProvider';
import { Box as PrimitiveBox } from '../primitives/box';
import { Dialog as Primitive } from '../primitives/dialog';
import type { SxProp } from '../slot-recipe';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';
import { Button, type ButtonProps } from './button';

/**
 * One multi-slot recipe owns every dialog part: slot identity (`data-cl-slot`),
 * base styles, the `alignment` variant, and the appearance cascade. The composable
 * parts below each read their own slot from `useRecipe(dialogRecipe)` and spread it
 * onto the bridged headless primitive; the high-level `<Dialog>` reads every slot
 * from a single call so the `alignment` variant threads through consistently. The
 * headless parts no longer emit `data-cl-slot` — slot identity is applied here, in
 * the styled layer.
 */
export const dialogRecipe = defineSlotRecipe(theme => ({
  slots: {
    trigger: { slot: 'dialog-trigger' },
    backdrop: { slot: 'dialog-backdrop' },
    viewport: { slot: 'dialog-viewport' },
    popup: { slot: 'dialog-popup' },
    dismiss: { slot: 'dialog-dismiss' },
    progress: { slot: 'dialog-progress' },
    progressStep: { slot: 'dialog-progress-step' },
    title: { slot: 'dialog-title' },
    description: { slot: 'dialog-description' },
    content: { slot: 'dialog-content' },
    actions: { slot: 'dialog-actions' },
    close: { slot: 'dialog-close' },
  },
  base: {
    backdrop: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'color-mix(in oklab, #000, transparent 50%)',
      transition: 'opacity 150ms',
      '&[data-cl-starting-style], &[data-cl-ending-style]': {
        opacity: 0,
      },
    },
    viewport: {
      display: 'grid',
      placeItems: 'center',
      width: '100%',
      minHeight: '100%',
      padding: theme.spacing(4),
    },
    popup: {
      position: 'relative',
      backgroundColor: theme.color.primaryForeground,
      color: theme.color.primary,
      borderRadius: theme.rounded.lg,
      padding: theme.spacing(6),
      minWidth: '20rem',
      maxWidth: '32rem',
      width: '100%',
      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(3),
      transition: 'transform 150ms ease-out, opacity 150ms ease-out',
      '&[data-cl-starting-style], &[data-cl-ending-style]': {
        opacity: 0,
        transform: 'scale(0.98)',
      },
    },
    dismiss: {
      position: 'absolute',
      top: theme.spacing(3),
      insetInlineEnd: theme.spacing(3),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: theme.spacing(6),
      height: theme.spacing(6),
      padding: 0,
      border: 'none',
      borderRadius: theme.rounded.md,
      backgroundColor: 'transparent',
      color: theme.color.mutedForeground,
      ...theme.text('lg'),
      lineHeight: 1,
      cursor: 'pointer',
      transition: 'background-color 150ms, color 150ms',
      _hover: { backgroundColor: theme.alpha('primary', 8), color: theme.color.primary },
    },
    progress: {
      display: 'flex',
      gap: theme.spacing(1),
      width: '100%',
    },
    progressStep: {
      height: theme.spacing(1),
      flex: 1,
      borderRadius: theme.rounded.full,
      backgroundColor: theme.alpha('primary', 15),
      '&[data-cl-active]': { backgroundColor: theme.color.primary },
    },
    title: {
      ...theme.text('lg'),
      fontWeight: 600,
      margin: 0,
    },
    description: {
      ...theme.text('sm'),
      margin: 0,
      opacity: 0.8,
    },
    content: {
      ...theme.text('sm'),
    },
    actions: {
      display: 'flex',
      gap: theme.spacing(2),
      marginBlockStart: theme.spacing(2),
    },
    close: {
      alignSelf: 'flex-end',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingInline: theme.spacing(3),
      paddingBlock: theme.spacing(1),
      borderRadius: theme.rounded.md,
      backgroundColor: 'transparent',
      color: theme.color.primary,
      border: `1px solid ${theme.alpha('primary', 20)}`,
      ...theme.text('sm'),
      cursor: 'pointer',
    },
  },
  variants: {
    // Aligns the popup's flex children and inherited text; the actions row mirrors it.
    alignment: {
      start: {
        popup: { alignItems: 'flex-start', textAlign: 'start' },
        actions: { justifyContent: 'flex-end' },
      },
      center: {
        popup: { alignItems: 'center', textAlign: 'center' },
        actions: { justifyContent: 'center' },
      },
    },
    // Carries no styles — surfaces "is the dialog dismissible" as a targetable
    // `data-cl-close` state (and a swingset playground knob). The dismiss button
    // itself is rendered from the `close` prop in `DialogComponent`.
    close: { true: {}, false: {} },
  },
  defaultVariants: { alignment: 'start', close: true },
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    'dialog-trigger': true;
    'dialog-backdrop': true;
    'dialog-viewport': true;
    'dialog-popup': true;
    'dialog-dismiss': true;
    'dialog-progress': true;
    'dialog-progress-step': true;
    'dialog-title': true;
    'dialog-description': true;
    'dialog-content': true;
    'dialog-actions': true;
    'dialog-close': true;
  }
}

const Trigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Primitive.Trigger>>(
  function DialogTrigger(props, ref) {
    const { trigger } = useRecipe(dialogRecipe);
    return (
      <Primitive.Trigger
        ref={ref}
        {...props}
        {...trigger}
      />
    );
  },
);

const Backdrop = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Primitive.Backdrop>>(
  function DialogBackdrop(props, ref) {
    const { backdrop } = useRecipe(dialogRecipe);
    return (
      <Primitive.Backdrop
        ref={ref}
        {...props}
        {...backdrop}
      />
    );
  },
);

const Viewport = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Primitive.Viewport>>(
  function DialogViewport(props, ref) {
    const { viewport } = useRecipe(dialogRecipe);
    return (
      <Primitive.Viewport
        ref={ref}
        {...props}
        {...viewport}
      />
    );
  },
);

const Popup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Primitive.Popup>>(
  function DialogPopup(props, ref) {
    const { popup } = useRecipe(dialogRecipe);
    return (
      <Primitive.Popup
        ref={ref}
        {...props}
        {...popup}
      />
    );
  },
);

const Title = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<typeof Primitive.Title>>(
  function DialogTitle(props, ref) {
    const { title } = useRecipe(dialogRecipe);
    return (
      <Primitive.Title
        ref={ref}
        {...props}
        {...title}
      />
    );
  },
);

const Description = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof Primitive.Description>
>(function DialogDescription(props, ref) {
  const { description } = useRecipe(dialogRecipe);
  return (
    <Primitive.Description
      ref={ref}
      {...props}
      {...description}
    />
  );
});

const Close = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Primitive.Close>>(
  function DialogClose(props, ref) {
    const { close } = useRecipe(dialogRecipe);
    return (
      <Primitive.Close
        ref={ref}
        {...props}
        {...close}
      />
    );
  },
);

// ─── High-level Dialog ───────────────────────────────────────────────────────────

/** A single action in the dialog's action row. */
export interface DialogAction {
  /** Button contents. */
  label: React.ReactNode;
  /** Click handler. When omitted on the `secondary` action, the dialog closes instead. */
  onClick?: () => void;
  /** Override the button color (e.g. `destructive` for a primary delete action). */
  color?: ButtonProps['color'];
  /** Disable the button. */
  disabled?: boolean;
}

/** The structured action row: a brand-colored primary and an optional secondary action. */
export interface DialogActions {
  primary?: DialogAction;
  secondary?: DialogAction;
}

/** A step indicator: the active step (1-based) out of `total`. */
export interface DialogProgress {
  current: number;
  total: number;
}

export interface DialogProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called when the open state changes (trigger, action, dismiss, Escape, outside press). */
  onOpenChange?: (open: boolean) => void;
  /** Trap focus and make the rest of the page inert while open. Default: `true`. */
  modal?: boolean;
  /** Render prop for the element that opens the dialog. Spread `props` onto your own component. */
  trigger?: (props: Omit<React.HTMLAttributes<HTMLElement>, 'color'>) => React.ReactNode;
  /** Alignment of the header, description, content, and actions. Default: `start`. */
  alignment?: 'start' | 'center';
  /** Optional step indicator. Omit to hide the stepper. */
  progress?: DialogProgress;
  /** Optional title; wired to the popup's `aria-labelledby`. */
  header?: React.ReactNode;
  /** Optional supporting text; wired to the popup's `aria-describedby`. */
  description?: React.ReactNode;
  /** Body content, rendered between the description and the actions. */
  children?: React.ReactNode;
  /** The action row — a structured `{ primary, secondary }` object or arbitrary nodes. */
  actions?: DialogActions | React.ReactNode;
  /** Show the dismiss ("✕") affordance in the corner. Default: `true`. */
  close?: boolean;
  /** Style overrides applied to the dialog surface (`dialog-popup`). */
  sx?: SxProp;
}

/** Structured actions are plain objects with `primary` / `secondary`; anything else is a node. */
function isStructuredActions(actions: DialogProps['actions']): actions is DialogActions {
  return (
    actions != null &&
    typeof actions === 'object' &&
    !React.isValidElement(actions) &&
    ('primary' in actions || 'secondary' in actions)
  );
}

/**
 * The opinionated mosaic Dialog. Composes the headless dialog primitive into a conventional
 * layout — optional progress stepper, header, description, body, dismiss affordance, and an
 * aligned action row — behind a single props API. For bespoke structure, drop down to the
 * composable parts attached to this component (`Dialog.Root`, `Dialog.Popup`, …).
 */
function DialogComponent(props: DialogProps) {
  const {
    open,
    defaultOpen,
    onOpenChange,
    modal,
    trigger,
    alignment = 'start',
    progress,
    header,
    description,
    children,
    actions,
    close = true,
    sx,
  } = props;

  const theme = useMosaicTheme();
  const slots = useRecipe(dialogRecipe, { variants: { alignment, close } });

  const renderActions = () => {
    if (actions == null) {
      return null;
    }
    if (!isStructuredActions(actions)) {
      return actions;
    }
    const { primary, secondary } = actions;
    return (
      <>
        {secondary ? (
          secondary.onClick ? (
            <Button
              color={secondary.color ?? 'secondary'}
              onClick={secondary.onClick}
              disabled={secondary.disabled}
            >
              {secondary.label}
            </Button>
          ) : (
            // No handler → the secondary action simply dismisses the dialog.
            <Primitive.Close
              render={(p: Omit<React.HTMLAttributes<HTMLElement>, 'color'>) => (
                <Button
                  {...p}
                  color={secondary.color ?? 'secondary'}
                  disabled={secondary.disabled}
                >
                  {secondary.label}
                </Button>
              )}
            />
          )
        ) : null}
        {primary ? (
          <Button
            color={primary.color}
            onClick={primary.onClick}
            disabled={primary.disabled}
          >
            {primary.label}
          </Button>
        ) : null}
      </>
    );
  };

  return (
    <Primitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      {trigger ? <Trigger render={trigger} /> : null}
      <Primitive.Portal>
        <Primitive.Backdrop {...slots.backdrop} />
        <Primitive.Viewport {...slots.viewport}>
          <Primitive.Popup
            {...slots.popup}
            css={sx ? { ...slots.popup.css, ...(typeof sx === 'function' ? sx(theme) : sx) } : slots.popup.css}
          >
            {close ? (
              <Primitive.Close
                {...slots.dismiss}
                aria-label='Close'
              >
                ✕
              </Primitive.Close>
            ) : null}
            {progress ? (
              <PrimitiveBox {...slots.progress}>
                {Array.from({ length: progress.total }, (_, i) => (
                  <PrimitiveBox
                    key={i}
                    {...slots.progressStep}
                    {...(i < progress.current ? { 'data-cl-active': '' } : {})}
                  />
                ))}
              </PrimitiveBox>
            ) : null}
            {header != null ? <Primitive.Title {...slots.title}>{header}</Primitive.Title> : null}
            {description != null ? (
              <Primitive.Description {...slots.description}>{description}</Primitive.Description>
            ) : null}
            {children != null ? <PrimitiveBox {...slots.content}>{children}</PrimitiveBox> : null}
            {actions != null ? <PrimitiveBox {...slots.actions}>{renderActions()}</PrimitiveBox> : null}
          </Primitive.Popup>
        </Primitive.Viewport>
      </Primitive.Portal>
    </Primitive.Root>
  );
}

/**
 * Styled mosaic Dialog. The default export is the opinionated, props-based component; the
 * composable parts are attached for cases the high-level API doesn't cover.
 */
export const Dialog: typeof DialogComponent & {
  Root: typeof Primitive.Root;
  Trigger: typeof Trigger;
  Portal: typeof Primitive.Portal;
  Backdrop: typeof Backdrop;
  Viewport: typeof Viewport;
  Popup: typeof Popup;
  Title: typeof Title;
  Description: typeof Description;
  Close: typeof Close;
} = Object.assign(DialogComponent, {
  Root: Primitive.Root,
  Trigger,
  Portal: Primitive.Portal,
  Backdrop,
  Viewport,
  Popup,
  Title,
  Description,
  Close,
});
