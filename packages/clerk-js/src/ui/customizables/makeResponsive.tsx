import React from 'react';

import { isDataUri, isValidUrl } from '../../utils';

type Responsive<T = Record<never, never>> = T & {
  size?: number;
  xDescriptors?: number[];
};

type ResponsivePrimitive<T> = React.FunctionComponent<Responsive<T>>;

export const makeResponsive = <P extends React.JSX.IntrinsicElements['img']>(
  Component: React.FunctionComponent<P>,
): ResponsivePrimitive<P> => {
  const responsiveComponent = React.forwardRef((props: Responsive<any>, ref) => {
    const { src, size = 80, xDescriptors = [1, 2], ...restProps } = props;
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

  const newSrc = new URL(src);
  if (width) {
    newSrc.searchParams.append('width', width?.toString());
  }

  return newSrc.href;
};
