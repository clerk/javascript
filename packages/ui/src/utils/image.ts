import { isomorphicAtob } from '@clerk/shared/isomorphicAtob';

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
  // TODO: Next person who touches this util should check
  // whether this check is still necessary :)
  if ((url || '').includes('gravatar') || (url || '').includes('avatar_placeholder')) {
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
