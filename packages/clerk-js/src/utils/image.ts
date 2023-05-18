import { isomorphicAtob } from '@clerk/shared';
import type { EncodedImageData } from '@clerk/types';

export const isDefaultImage = (url: string) => {
  // Remove this check when renaming experimental_imageUrl to imageUrl
  if ((url || '').includes('gravatar')) {
    return true;
  }

  try {
    const encoded = new URL(url).pathname.replace('/', '');
    const decoded = isomorphicAtob(encoded);
    const obj = JSON.parse(decoded) as EncodedImageData;
    return obj.type === 'default';
  } catch {
    return false;
  }
};
