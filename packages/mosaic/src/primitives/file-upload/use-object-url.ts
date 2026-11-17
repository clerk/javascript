'use client';

import { useEffect, useState } from 'react';

/**
 * The object URL for a locally picked file, revoked when the file is replaced or the caller
 * unmounts. Answers `undefined` for no file, so a caller can fall back to an already stored image.
 */
export function useObjectUrl(file: File | undefined): string | undefined {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!file) {
      // eslint-disable-next-line react/set-state-in-effect -- Synchronize the object URL with the external file resource.
      setUrl(undefined);
      return;
    }
    const created = URL.createObjectURL(file);
    setUrl(created);
    return () => {
      URL.revokeObjectURL(created);
      setUrl(undefined);
    };
  }, [file]);

  return url;
}
