import { useRef, useState } from 'react';

import type { LocalizableError } from '../../../localization';
import { toFormError } from '../../../utils/form-error';

export interface UserProfilePictureControllerOptions {
  onChange?: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
}

export interface UserProfilePictureController {
  onChange?: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  isPending: boolean;
  error: LocalizableError | undefined;
}

export function useUserProfilePictureController({
  onChange,
  onRemove,
}: UserProfilePictureControllerOptions): UserProfilePictureController {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<LocalizableError>();
  const inFlight = useRef(false);

  const run = async (action: () => Promise<void>) => {
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;
    setIsPending(true);
    setError(undefined);
    try {
      await action();
    } catch (cause) {
      setError(toFormError(cause).global);
    } finally {
      inFlight.current = false;
      setIsPending(false);
    }
  };

  return {
    onChange: onChange ? file => run(() => onChange(file)) : undefined,
    onRemove: onRemove ? () => run(onRemove) : undefined,
    isPending,
    error,
  };
}
