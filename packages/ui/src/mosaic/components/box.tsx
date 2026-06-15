import React from 'react';

import { useMosaicTheme } from '../providers/mosaic-provider';
import { Box as Primitive, type BoxProps as PrimitiveBoxProps } from '../primitives/box';
import type { SxProp } from '../slot-recipe';

export type BoxProps = PrimitiveBoxProps & {
  /** Per-instance styles — a plain object or a function of the resolved Mosaic theme. */
  sx?: SxProp;
};

/** Minimal reset applied to every Box; overridable via `sx`. */
const reset = { boxSizing: 'border-box', margin: 0, padding: 0 } as const;

/**
 * General-purpose mosaic Box. Resolves `sx` against the Mosaic theme and passes it as a `css`
 * object to the headless Box primitive — Emotion converts it to a `className` at this JSX boundary
 * (the same boundary the `withMosaicSlot` bridge relies on), which the primitive forwards to its
 * element. `render` provides polymorphism.
 */
export const Box = React.forwardRef<HTMLDivElement, BoxProps>(function MosaicBox({ sx, ...rest }, ref) {
  const theme = useMosaicTheme();
  return (
    <Primitive
      ref={ref}
      css={[reset, typeof sx === 'function' ? sx(theme) : sx]}
      {...rest}
    />
  );
});
