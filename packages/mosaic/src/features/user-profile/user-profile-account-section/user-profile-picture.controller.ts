import { useRef, useState } from 'react';

import type { LocalizableError } from '../../../localization';
import type { SaveResult } from '../../../utils/save-result';
import { formErrorOf, unexpectedFormError } from '../../../utils/save-result';

export interface UserProfilePictureControllerOptions {
  onChange?: (file: File) => Promise<SaveResult>;
  onRemove?: () => Promise<SaveResult>;
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

  const run = async (action: () => Promise<SaveResult>) => {
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;
    setIsPending(true);
    setError(undefined);
    try {
      const result = await action();
      setError(formErrorOf(result.error)?.global);
    } catch (cause) {
      setError(unexpectedFormError(cause).global);
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
