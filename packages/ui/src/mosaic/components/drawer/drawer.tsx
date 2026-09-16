import type { DrawerFocusTarget, DrawerProps as HeadlessDrawerProps } from '@clerk/headless/drawer';
import { Drawer as Primitive, registerDrawerCssVars } from '@clerk/headless/drawer';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps, MosaicStyleProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { DialogContext, isOverlayDialog } from '../dialog';
import { styles } from './drawer.styles';

export type DrawerRootProps = HeadlessDrawerProps;
// The headless parts pass through, minus `className`/`style` and plus `xstyle`, like every Mosaic part.
type Passthrough<Part extends React.ElementType> = Omit<React.ComponentPropsWithoutRef<Part>, 'className' | 'style'> &
  MosaicStyleProps;

export type DrawerTriggerProps = Passthrough<typeof Primitive.Trigger>;
export type DrawerCloseProps = Passthrough<typeof Primitive.Close>;
export type DrawerTitleProps = Passthrough<typeof Primitive.Title>;
export type DrawerDescriptionProps = Passthrough<typeof Primitive.Description>;

export interface DrawerPopupProps extends MosaicComponentProps<'div'> {
  /** Where focus returns when the sheet closes. Default: the trigger. */
  finalFocus?: DrawerFocusTarget;
}

/**
 * The controlled/uncontrolled root: open state, dismissal, snap points, drag policy — all the
 * headless options, passed through. Registers the drag's custom properties once so the browser can
 * type and animate them cheaply.
 */
function Root(props: DrawerRootProps) {
  React.useEffect(() => {
    registerDrawerCssVars();
  }, []);
  return <Primitive.Root {...props} />;
}

/**
 * The sheet, and everything it needs to be one: the portal, the scrim, the box it rises in, and
 * the grip at its top. Closed, it sits entirely below the screen. Opened from inside a `profile` or
 * `card` dialog it takes the nested scrim, the way a prompt does there.
 */
const Popup = React.forwardRef<HTMLDivElement, DrawerPopupProps>(function DrawerPopup(
  { finalFocus, children, render, xstyle, ...rest },
  ref,
) {
  const host = React.useContext(DialogContext);
  const nested = isOverlayDialog(host);
  return (
    <Primitive.Portal>
      <Primitive.Backdrop
        {...mergeStyleProps(
          themeProps('drawer-backdrop', { nested }),
          stylex.props(reset.base, styles.backdrop, nested && styles.backdropNested),
        )}
      />
      <Primitive.Viewport
        {...mergeStyleProps(themeProps('drawer-viewport'), stylex.props(reset.base, styles.viewport))}
      >
        <Primitive.Popup
          ref={ref}
          render={render}
          finalFocus={finalFocus}
          {...mergeStyleProps(themeProps('drawer-popup'), stylex.props(reset.base, styles.popup, xstyle), rest)}
        >
          <Primitive.Handle {...mergeStyleProps(themeProps('drawer-handle'), stylex.props(reset.base, styles.handle))}>
            <span {...mergeStyleProps(themeProps('drawer-grip'), stylex.props(reset.base, styles.grip))} />
          </Primitive.Handle>
          <div {...mergeStyleProps(themeProps('drawer-content'), stylex.props(reset.base, styles.content))}>
            {children}
          </div>
        </Primitive.Popup>
      </Primitive.Viewport>
    </Primitive.Portal>
  );
});

const Trigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(function DrawerTrigger(
  { xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.Trigger
      ref={ref}
      {...mergeStyleProps(stylex.props(xstyle), rest)}
    />
  );
});

const Close = React.forwardRef<HTMLButtonElement, DrawerCloseProps>(function DrawerClose({ xstyle, ...rest }, ref) {
  return (
    <Primitive.Close
      ref={ref}
      {...mergeStyleProps(stylex.props(xstyle), rest)}
    />
  );
});

const Title = React.forwardRef<HTMLHeadingElement, DrawerTitleProps>(function DrawerTitle({ xstyle, ...rest }, ref) {
  return (
    <Primitive.Title
      ref={ref}
      {...mergeStyleProps(stylex.props(xstyle), rest)}
    />
  );
});

const Description = React.forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(function DrawerDescription(
  { xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.Description
      ref={ref}
      {...mergeStyleProps(stylex.props(xstyle), rest)}
    />
  );
});

/**
 * A bottom sheet: `Drawer.Root` holds the state, `Drawer.Trigger` opens it, and `Drawer.Popup`
 * renders the sheet with its scrim, portal and grip. `Drawer.Title` and `Drawer.Description` name
 * and describe it; `Drawer.Close` dismisses it from inside. Drag it down, press Escape, or press
 * outside to dismiss.
 */
export const Drawer = {
  Root,
  Popup,
  Trigger,
  Title,
  Description,
  Close,
};
