import { isDataUri, isValidUrl } from '@clerk/shared/internal/clerk-js/url';
import React from 'react';

type Responsive<T = Record<never, never>> = T & {
  size?: number;
  xDescriptors?: number[];
};

// BASE_IMAGE_WIDTH is the default "small size" for Clerk images.
// Images are rendered at a multiple of this resolution (currently 1x or 2x)
// NOTE: img.clerk.com only returns the true aspect ratio for a few specific widths.
// For other widths, it returns the next largest size. See https://clerk.com/docs/guides/development/image-optimization/imageurl-image-optimization
// Currently, 80 and 160 are available exact widths returned by img.clerk.com.
// Before updating this value, or returning a new size multiple, recommend
// ensuring that img.clerk.com also returns that new size exactly.
const BASE_IMAGE_WIDTH = 80;

type ResponsivePrimitive<T> = React.FunctionComponent<Responsive<T>>;

export const makeResponsive = <P extends React.JSX.IntrinsicElements['img']>(
  Component: React.FunctionComponent<P>,
): ResponsivePrimitive<P> => {
  const responsiveComponent = React.forwardRef((props: Responsive<any>, ref) => {
    const { src, size = BASE_IMAGE_WIDTH, xDescriptors = [1, 2], ...restProps } = props;
    const shouldOptimize = isClerkImage(src);

    return (
      <Component
        srcSet={shouldOptimize ? generateSrcSet({ src, width: size, xDescriptors }) : undefined}
        src={shouldOptimize ? generateSrc({ src, width: size * 2 }) : src}
        {...restProps}
        ref={ref}
      />
    );
  });

  const displayName = Component.displayName || Component.name || 'Component';
  responsiveComponent.displayName = `Responsive${displayName}`.replace('_', '');
  return responsiveComponent as ResponsivePrimitive<P>;
};

const CLERK_IMAGE_URL_BASES = ['https://img.clerk.com/', 'https://img.clerkstage.dev/', 'https://img.lclclerk.com/'];

const isClerkImage = (src?: string): boolean => {
  return !!CLERK_IMAGE_URL_BASES.some(base => src?.includes(base));
};

const generateSrcSet = ({ src, width, xDescriptors }: { src?: string; width: number; xDescriptors: number[] }) => {
  if (!src) {
    return '';
  }

  return xDescriptors.map(i => `${generateSrc({ src, width: width * i })} ${i}x`).toString();
};

const generateSrc = ({ src, width }: { src?: string; width: number }) => {
  if (!isValidUrl(src) || isDataUri(src)) {
    return src;
  }

  if (typeof src !== 'string') {
    return src;
  }

  const newSrc = new URL(src);
  if (width) {
    newSrc.searchParams.append('width', width?.toString());
  }

  return newSrc.href;
};
