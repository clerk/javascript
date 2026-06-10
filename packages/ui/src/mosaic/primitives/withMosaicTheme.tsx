import React from 'react';

import { useMosaicTheme } from '../MosaicProvider';
import type { Mosaic } from '../types';

/**
 * Bridges a headless primitive into mosaic: accepts an `sx` prop (a static
 * `StyleRule` or a `(theme) => StyleRule` resolver), resolves it against the
 * mosaic theme, and forwards it as an Emotion `css` prop. The headless part
 * turns that into a `className` and forwards it to its rendered DOM node.
 */
export const withMosaicTheme = <P,>(Component: React.FunctionComponent<P>): React.FunctionComponent<Mosaic<P>> => {
  const Wrapped = React.forwardRef((props: Mosaic<any>, ref) => {
    const { sx, ...rest } = props;
    const theme = useMosaicTheme();
    const css = typeof sx === 'function' ? sx(theme) : sx;
    return (
      <Component
        css={css}
        {...rest}
        ref={ref}
      />
    );
  });
  Wrapped.displayName = `Mosaic${Component.displayName || Component.name || 'Component'}`;
  return Wrapped as React.FunctionComponent<Mosaic<P>>;
};
