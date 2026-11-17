'use client';

import React from 'react';

import type { MosaicElementProps } from '../../props';
import { themeProps } from '../../props';
import { Card } from '../card';
import { Popover } from '../popover';
import { useSlot } from './switcher.context';
import { styles } from './switcher-popup.styles';

export interface SwitcherPopupProps extends MosaicElementProps<'div'> {
  /** Names the popup. */
  'aria-label': string;
  /**
   * Shows Clerk branding at the foot of the card.
   *
   * @default true
   */
  renderBranding?: boolean;
}

/** The floating popup: portals, positions against the trigger, and paints a `Card` holding the header and rows. */
export const SwitcherPopup = React.forwardRef<HTMLDivElement, SwitcherPopupProps>(function SwitcherPopup(
  { renderBranding, children, xstyle, ...rest },
  ref,
) {
  const slot = useSlot();
  return (
    <Popover.Popup
      ref={ref}
      {...themeProps(slot('popover'))}
      xstyle={[styles.popup, xstyle]}
      {...rest}
    >
      <Card.Root renderBranding={renderBranding}>{children}</Card.Root>
    </Popover.Popup>
  );
});

export declare namespace SwitcherPopup {
  type Props = SwitcherPopupProps;
}
