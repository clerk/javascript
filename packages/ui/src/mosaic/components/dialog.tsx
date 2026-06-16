import React from 'react';
import type { ReactNode } from 'react';

import { useDialogContext } from '@clerk/headless/dialog';
import type { DialogProps as HeadlessDialogProps } from '@clerk/headless/dialog';

import { Dialog as Primitive } from '../primitives/dialog';
import { defineSlotRecipe, useRecipe } from '../slot-recipe';
import type { RecipeVariantProps } from '../slot-recipe';

/**
 * One multi-slot recipe owns every dialog part: slot identity (`data-cl-slot`),
 * base styles, and the appearance cascade. Each exported part below reads its
 * own slot from `useRecipe(dialogRecipe)` and spreads it onto the bridged
 * headless primitive. The headless parts no longer emit `data-cl-slot` — slot
 * identity is applied here, in the styled layer.
 */
export const dialogRecipe = defineSlotRecipe(theme => ({
  slots: {
    backdrop: { slot: 'dialog-backdrop' },
    viewport: { slot: 'dialog-viewport' },
    popup: { slot: 'dialog-popup' },
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
  },
  variants: {
    size: {
      md: {
        popup: { minWidth: '20rem', maxWidth: '32rem' },
      },
      lg: {
        popup: { minWidth: '28rem', maxWidth: '48rem' },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
}));

type DialogVariantProps = RecipeVariantProps<typeof dialogRecipe>;

const DialogVariantContext = React.createContext<DialogVariantProps>({});

declare module '../registry' {
  interface MosaicSlotRegistry {
    'dialog-backdrop': true;
    'dialog-viewport': true;
    'dialog-popup': true;
  }
}

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
    const variantProps = React.useContext(DialogVariantContext);
    const { popup } = useRecipe(dialogRecipe, variantProps);
    return (
      <Primitive.Popup
        ref={ref}
        {...props}
        {...popup}
      />
    );
  },
);

interface DialogProps extends Pick<HeadlessDialogProps, 'open' | 'defaultOpen' | 'onOpenChange' | 'modal'> {
  trigger: React.ComponentProps<typeof Primitive.Trigger>['render'];
  children: ReactNode | ((ctx: { close: () => void }) => ReactNode);
  size?: DialogVariantProps['size'];
}

function DialogContent({ children }: { children: DialogProps['children'] }) {
  const { setOpen } = useDialogContext();
  if (typeof children !== 'function') return <>{children}</>;
  return <>{children({ close: () => setOpen(false) })}</>;
}

export function Dialog({ trigger, children, size, open, defaultOpen, onOpenChange, modal }: DialogProps) {
  return (
    <DialogVariantContext.Provider value={{ size }}>
      <Primitive.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        modal={modal}
      >
        <Primitive.Trigger render={trigger} />
        <Primitive.Portal>
          <Backdrop />
          <Viewport>
            <Popup>
              <DialogContent>{children}</DialogContent>
            </Popup>
          </Viewport>
        </Primitive.Portal>
      </Primitive.Root>
    </DialogVariantContext.Provider>
  );
}

/** Compound parts for power-user / custom dialog layouts. */
Dialog.Root = Primitive.Root;
Dialog.Trigger = Primitive.Trigger;
Dialog.Portal = Primitive.Portal;
Dialog.Backdrop = Backdrop;
Dialog.Viewport = Viewport;
Dialog.Popup = Popup;
Dialog.Title = Primitive.Title;
Dialog.Description = Primitive.Description;
Dialog.Close = Primitive.Close;
