import { isValidUrl } from '@clerk/shared/internal/clerk-js/url';

export const sanitizeCustomLinkURL = (url: string): string => {
  if (!url) {
    throw new Error('Clerk: URL is required for custom links');
  }
  if (isValidUrl(url)) {
    return url;
  }
  return url.charAt(0) === '/' ? url : `/${url}`;
};
