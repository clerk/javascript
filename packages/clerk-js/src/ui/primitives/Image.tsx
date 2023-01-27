import React from 'react';

import { generateSrc, generateSrcSet } from '../../utils';
import type { PrimitiveProps, StateProps } from '../styledSystem';
import { applyDataStateProps } from './applyDataStateProps';

export type ImageProps = PrimitiveProps<'img'> &
  StateProps & {
    size?: number;
    xDescriptors?: number[];
  };

export const Image = React.forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  const { src, size = 80, xDescriptors = [1, 2], ...rest } = props;

  return (
    <img
      srcSet={generateSrcSet({ src, width: size, xDescriptors })}
      src={generateSrc({ src, width: size * 2 })}
      {...applyDataStateProps(rest)}
      ref={ref}
    />
  );
});
