import React from 'react';

import { PrimitiveProps } from '../styledSystem';

export type ImageProps = PrimitiveProps<'img'>;

export const Image = React.forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  return (
    <img
      {...props}
      ref={ref}
    />
  );
});
