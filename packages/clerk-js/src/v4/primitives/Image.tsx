import React from 'react';

import { PrimitiveProps, StateProps } from '../styledSystem';
import { applyDataStateProps } from './applyDataStateProps';

export type ImageProps = PrimitiveProps<'img'> & StateProps;

export const Image = React.forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  return (
    <img
      {...applyDataStateProps(props)}
      ref={ref}
    />
  );
});
