import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Holds the avatar a story is showing and swaps in an object URL for a picked file, revoking the
 * one it replaces so repeated picks don't retain every earlier file for the life of the page.
 * Only URLs this hook created are revoked, so the remote avatar it starts on is left alone.
 */
export function usePreviewImage(initialUrl?: string) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialUrl);
  const objectUrlRef = useRef<string | undefined>(undefined);

  const release = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = undefined;
    }
  }, []);

  useEffect(() => release, [release]);

  const showFile = useCallback(
    (file: File) => {
      release();
      const next = URL.createObjectURL(file);
      objectUrlRef.current = next;
      setImageUrl(next);
    },
    [release],
  );

  const clearImage = useCallback(() => {
    release();
    setImageUrl(undefined);
  }, [release]);

  return { imageUrl, showFile, clearImage };
}
