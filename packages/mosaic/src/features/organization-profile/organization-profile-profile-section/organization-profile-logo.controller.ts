import { useRef, useState } from 'react';

import type { LocalizableError } from '../../../localization';
import { FileUpload } from '../../../primitives/file-upload';
import { toFormError } from '../../../utils/errors';

export interface OrganizationProfileLogoControllerOptions {
  onChange?: (file: File) => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
}

export function useOrganizationProfileLogoController({ onChange, onRemove }: OrganizationProfileLogoControllerOptions) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<LocalizableError>();
  const [preview, setPreview] = useState<File>();
  const previewUrl = FileUpload.useObjectUrl(preview);
  const inFlight = useRef(false);

  const run = async (action: () => Promise<void>, revert?: () => void) => {
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;
    setIsPending(true);
    setError(undefined);
    try {
      await action();
    } catch (cause) {
      revert?.();
      setError(toFormError(cause).global);
    } finally {
      inFlight.current = false;
      setIsPending(false);
    }
  };

  return {
    previewUrl,
    isPending,
    error,
    onChange: onChange
      ? (file: File) =>
          run(
            async () => {
              setPreview(file);
              await onChange(file);
            },
            () => setPreview(undefined),
          )
      : undefined,
    onRemove: onRemove
      ? () =>
          run(async () => {
            await onRemove();
            setPreview(undefined);
          })
      : undefined,
  };
}
