import { isomorphicAtob } from '@clerk/shared';

/**
 * @private
 */
interface EncodedImageData {
  type: 'default' | 'proxy';
  iid?: string;
  rid?: string;
  src?: string;
  initials?: string;
}

export const isDefaultImage = (url: string) => {
  // TODO: Remove this check when renaming experimental_imageUrl to imageUrl
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
