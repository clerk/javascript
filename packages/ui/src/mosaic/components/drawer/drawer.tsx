import type { DrawerProps as HeadlessDrawerProps } from '@clerk/headless/drawer';
import { Drawer as Primitive, registerDrawerCssVars } from '@clerk/headless/drawer';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { DialogContext } from '../dialog';
import { heights, styles } from './drawer.styles';

export type DrawerRootProps = HeadlessDrawerProps;
export type DrawerTriggerProps = React.ComponentPropsWithoutRef<typeof Primitive.Trigger>;
export type DrawerCloseProps = React.ComponentPropsWithoutRef<typeof Primitive.Close>;
export type DrawerTitleProps = React.ComponentPropsWithoutRef<typeof Primitive.Title>;
export type DrawerDescriptionProps = React.ComponentPropsWithoutRef<typeof Primitive.Description>;
export type DrawerHeight = keyof typeof heights;

export interface DrawerPopupProps extends MosaicComponentProps<'div'> {
  /**
   * How tall the sheet stands: from its content, at least two thirds of the screen, or the
   * screen less a hand's width. @default 'content'
   */
  height?: DrawerHeight;
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

const Trigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(function DrawerTrigger(props, ref) {
  return (
    <Primitive.Trigger
      ref={ref}
      {...props}
    />
  );
});

const Close = React.forwardRef<HTMLButtonElement, DrawerCloseProps>(function DrawerClose(props, ref) {
  return (
    <Primitive.Close
      ref={ref}
      {...props}
    />
  );
});

const Title = React.forwardRef<HTMLHeadingElement, DrawerTitleProps>(function DrawerTitle(props, ref) {
  return (
    <Primitive.Title
      ref={ref}
      {...props}
    />
  );
});

const Description = React.forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(
  function DrawerDescription(props, ref) {
    return (
      <Primitive.Description
        ref={ref}
        {...props}
      />
    );
  },
);

/**
 * The sheet, and everything it needs to be one: the portal, the scrim, the box it rises in, and
 * the grip at its top. Closed, it sits entirely below the screen. Opened from inside a `profile` or
 * `card` dialog it takes the nested scrim, the way a prompt does there.
 */
const Popup = React.forwardRef<HTMLDivElement, DrawerPopupProps>(function DrawerPopup(
  { height = 'content', children, render, className, style, ...rest },
  ref,
) {
  const host = React.useContext(DialogContext);
  const nested = host !== null && !host.inline;
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
          {...mergeStyleProps(
            themeProps('drawer-popup', { height }),
            stylex.props(reset.base, styles.popup, heights[height]),
            className,
            style,
          )}
          {...rest}
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

/**
 * A bottom sheet: `Drawer.Root` holds the state, `Drawer.Trigger` opens it, and `Drawer.Popup`
 * renders the sheet with its scrim, portal and grip. `Drawer.Title` and `Drawer.Description` name
 * and describe it; `Drawer.Close` dismisses it from inside. Drag it down, press Escape, or press
 * outside to dismiss.
 */
export const Drawer = { Root, Trigger, Popup, Title, Description, Close };
