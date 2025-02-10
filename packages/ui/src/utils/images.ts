import { isDataUri, isValidUrl } from './validators';

export const generateSrcSet = ({ src, width }: { src?: string; width: number }) => {
  if (!src) {
    return '';
  }

  return generateSrc({ src, width: width });
};

export const generateSrc = ({ src, width }: { src?: string; width: number }) => {
  if (!isValidUrl(src) || isDataUri(src)) {
    return src;
  }

  const newSrc = new URL(src);
  if (width) {
    newSrc.searchParams.append('width', width?.toString());
  }

  return newSrc.href;
};
