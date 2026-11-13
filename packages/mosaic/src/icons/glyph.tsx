import * as React from 'react';

import type { IconName } from './registry';

/**
 * A default icon glyph — receives `svg` props (sizing/color flow in via `className`) and forwards a ref.
 * `iconName` is the key `MosaicProvider` overrides it by.
 */
export type IconComponent<Name extends string = IconName> = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<'svg'> & React.RefAttributes<SVGSVGElement>
> & { iconName: Name };

/**
 * Builds a glyph from its inner `<path>` markup. Glyphs omit `width`/`height` so the `Icon` recipe
 * controls size, and use `currentColor` so they inherit text color. Grow the set on demand.
 */
export function glyph<const Name extends string>(
  name: Name,
  children: React.ReactNode,
  viewBox = '0 0 16 16',
): IconComponent<Name> {
  const component = React.forwardRef<SVGSVGElement, React.ComponentPropsWithoutRef<'svg'>>((props, ref) => (
    <svg
      ref={ref}
      viewBox={viewBox}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      {children}
    </svg>
  ));
  return Object.assign(component, { iconName: name });
}
