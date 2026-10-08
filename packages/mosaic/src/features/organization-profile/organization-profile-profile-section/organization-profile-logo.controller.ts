import { useRef, useState } from 'react';

import type { LocalizableError } from '../../../localization';
import { FileUpload } from '../../../primitives/file-upload';
import { toGlobalError } from '../../../utils/errors';

interface OrganizationProfileLogoControllerOptions {
  onChange?: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
}

interface OrganizationProfileLogoController {
  onChange?: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  isPending: boolean;
  previewUrl: string | undefined;
  error: LocalizableError | undefined;
}

export function useOrganizationProfileLogoController({
  onChange,
  onRemove,
}: OrganizationProfileLogoControllerOptions): OrganizationProfileLogoController {
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
      setError(toGlobalError(cause));
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
