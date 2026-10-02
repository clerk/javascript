import { useRef, useState } from 'react';

import type { LocalizableError } from '../../../localization';
import { FileUpload } from '../../../primitives/file-upload';
import { toFormError } from '../../../utils/form-error';

export interface UserProfilePictureControllerOptions {
  onChange?: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
}

export interface UserProfilePictureController {
  onChange?: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  isPending: boolean;
  previewUrl: string | undefined;
  error: LocalizableError | undefined;
}

export function useUserProfilePictureController({
  onChange,
  onRemove,
}: UserProfilePictureControllerOptions): UserProfilePictureController {
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
    onChange: onChange
      ? file =>
          run(
            () => {
              setPreview(file);
              return onChange(file);
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
    isPending,
    previewUrl,
    error,
  };
}
