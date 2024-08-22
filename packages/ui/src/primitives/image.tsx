import * as React from 'react';

import { generateSrc, generateSrcSet } from '~/utils/images';
import { isClerkImage } from '~/utils/validators';

// BASE_IMAGE_WIDTH is the default "small size" for Clerk images.
// Images are rendered at a multiple of this resolution (currently 1x or 2x)
// NOTE: img.clerk.com only returns the true aspect ratio for a few specific widths.
// For other widths, it returns the next largest size. See https://clerk.com/docs/guides/image-optimization/imageurl-image-optimization
// Currently, 80 and 160 are available exact widths returned by img.clerk.com.
// Before updating this value, or returning a new size multiple, recommend
// ensuring that img.clerk.com also returns that new size exactly.
const BASE_IMAGE_WIDTH = 80;

export const Image = React.forwardRef(function Image(
  {
    src,
    size = BASE_IMAGE_WIDTH,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    size?: number;
  },
  forwardedRef: React.ForwardedRef<HTMLImageElement>,
) {
  const shouldOptimize = isClerkImage(src);
  return (
    <img
      ref={forwardedRef}
      data-image=''
      crossOrigin='anonymous'
      srcSet={shouldOptimize ? generateSrcSet({ src, width: size }) : undefined}
      src={shouldOptimize ? generateSrc({ src, width: size * 2 }) : src}
      alt={props.alt}
      {...props}
    />
  );
});
