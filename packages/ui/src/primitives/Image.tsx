import React from 'react';

import type { PrimitiveProps, StateProps } from '../styledSystem';
import { applyDataStateProps } from './applyDataStateProps';

export type ImageProps = PrimitiveProps<'img'> & StateProps;

export const Image = React.forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  return (
    <img
      crossOrigin='anonymous'
      {...applyDataStateProps(props)}
      ref={ref}
    />
  );
});
