import React from 'react';

import { Dialog as Primitive } from '../primitives/dialog';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';

/**
 * One multi-slot recipe owns every dialog part: slot identity (`data-cl-slot`),
 * base styles, and the appearance cascade. Each exported part below reads its
 * own slot from `useRecipe(dialogRecipe)` and spreads it onto the bridged
 * headless primitive. The headless parts no longer emit `data-cl-slot` — slot
 * identity is applied here, in the styled layer.
 */
const dialogRecipe = defineSlotRecipe(theme => ({
  slots: {
    trigger: { slot: 'dialog-trigger' },
    backdrop: { slot: 'dialog-backdrop' },
    viewport: { slot: 'dialog-viewport' },
    popup: { slot: 'dialog-popup' },
    title: { slot: 'dialog-title' },
    description: { slot: 'dialog-description' },
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
      transition: 'transform 150ms ease-out, opacity 150ms ease-out',
      '&[data-cl-starting-style], &[data-cl-ending-style]': {
        opacity: 0,
        transform: 'scale(0.98)',
      },
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
}));

declare module '../registry' {
  interface MosaicSlotRegistry {
    'dialog-trigger': true;
    'dialog-backdrop': true;
    'dialog-viewport': true;
    'dialog-popup': true;
    'dialog-title': true;
    'dialog-description': true;
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

/** Styled mosaic Dialog components built on headless Dialog primitives. */
export const Dialog: {
  Root: typeof Primitive.Root;
  Trigger: typeof Trigger;
  Portal: typeof Primitive.Portal;
  Backdrop: typeof Backdrop;
  Viewport: typeof Viewport;
  Popup: typeof Popup;
  Title: typeof Title;
  Description: typeof Description;
  Close: typeof Close;
} = {
  Root: Primitive.Root,
  Trigger,
  Portal: Primitive.Portal,
  Backdrop,
  Viewport,
  Popup,
  Title,
  Description,
  Close,
};
