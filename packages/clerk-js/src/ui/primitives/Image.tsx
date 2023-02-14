import React from 'react';

import { generateSrc, generateSrcSet, isClerkImage } from '../../utils';
import type { PrimitiveProps, StateProps } from '../styledSystem';
import { applyDataStateProps } from './applyDataStateProps';

export type ImageProps = PrimitiveProps<'img'> &
  StateProps & {
    size?: number;
    xDescriptors?: number[];
  };

export const Image = React.forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  const { src, size = 80, xDescriptors = [1, 2], ...rest } = props;
  const shouldAdjustSize = isClerkImage(src);

  return (
    <img
      srcSet={shouldAdjustSize ? generateSrcSet({ src, width: size, xDescriptors }) : undefined}
      src={shouldAdjustSize ? generateSrc({ src, width: size * 2 }) : src}
      {...applyDataStateProps(rest)}
      ref={ref}
    />
  );
});
