import React from 'react';

import type { SlotProps } from '../slot-recipe';

/**
 * The props a bridged mosaic primitive accepts: the headless part's own props
 * plus the per-slot props produced by a recipe (`css`, `data-cl-slot`, state
 * data-attributes, `className`). All recipe props are optional so the bridged
 * part is still usable on its own.
 */
export type MosaicSlotProps<P> = P & Partial<SlotProps>;

/**
 * Bridges a headless primitive into mosaic. Accepts any `React.ElementType`
 * (ForwardRefExoticComponent, FunctionComponent, or intrinsic tag) and returns
 * a forwardRef component whose ref resolves to the wrapped element's actual
 * instance type (`React.ElementRef<C>`) rather than `unknown`.
 */
export function withMosaicSlot<C extends React.ElementType>(
  Component: C,
): React.ForwardRefExoticComponent<
  MosaicSlotProps<React.ComponentPropsWithoutRef<C>> & React.RefAttributes<React.ElementRef<C>>
> {
  type Props = MosaicSlotProps<React.ComponentPropsWithoutRef<C>>;
  type Ref = React.ElementRef<C>;

  const Wrapped = React.forwardRef<Ref, Props>((props, ref) => React.createElement(Component, { ...props, ref }));
  const componentName =
    typeof Component === 'string'
      ? Component
      : (Component as React.FunctionComponent).displayName ||
        (Component as React.FunctionComponent).name ||
        'Component';
  Wrapped.displayName = `MosaicSlot(${componentName})`;
  return Wrapped as React.ForwardRefExoticComponent<Props & React.RefAttributes<Ref>>;
}
