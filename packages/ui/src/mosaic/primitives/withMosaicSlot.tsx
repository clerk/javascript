import React from 'react';

import type { SlotProps } from '../slot-recipe';

/**
 * The props a bridged mosaic primitive accepts: the headless part's own props
 * plus the per-slot props produced by a recipe (`css`, `data-cl-slot`, state
 * data-attributes, `className`). All of `SlotProps` is optional so the bridged
 * part is still usable on its own.
 */
export type MosaicSlotProps<P> = P & Partial<SlotProps>;

/**
 * Bridges a headless primitive into mosaic. The styled layer resolves a recipe
 * slot and spreads the result onto the bridged part; Emotion turns the `css`
 * object into a `className` at this boundary, and the headless part forwards
 * that `className` (plus `data-cl-slot` and any state attrs) to its rendered
 * DOM node.
 */
export const withMosaicSlot = <P,>(
  Component: React.FunctionComponent<P>,
): React.ForwardRefExoticComponent<React.PropsWithoutRef<MosaicSlotProps<P>> & React.RefAttributes<unknown>> => {
  const Wrapped = React.forwardRef<unknown, MosaicSlotProps<P>>((props, ref) => (
    <Component
      {...(props as P)}
      ref={ref}
    />
  ));
  Wrapped.displayName = `MosaicSlot(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
};
