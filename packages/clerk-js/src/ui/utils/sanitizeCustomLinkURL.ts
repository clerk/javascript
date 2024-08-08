import { isValidUrl } from '../../utils';

export const sanitizeCustomLinkURL = (url: string): string => {
  if (!url) {
    throw new Error('Clerk: URL is required for custom links');
  }
  if (isValidUrl(url)) {
    return url;
  }
  return (url as string).charAt(0) === '/' ? url : `/${url}`;
};
