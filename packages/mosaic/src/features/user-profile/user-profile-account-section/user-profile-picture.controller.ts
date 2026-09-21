import { useRef, useState } from 'react';

import type { UserProfileSaveResult } from './user-profile-account-section.types';
import { formErrorOf } from './user-profile-account-section.types';

export interface UserProfilePictureControllerOptions {
  onChange?: (file: File) => Promise<UserProfileSaveResult>;
  onRemove?: () => Promise<UserProfileSaveResult>;
}

export interface UserProfilePictureController {
  onChange?: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  isPending: boolean;
  errorMessage: string | undefined;
}

export function useUserProfilePictureController({
  onChange,
  onRemove,
}: UserProfilePictureControllerOptions): UserProfilePictureController {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const inFlight = useRef(false);

  const run = async (action: () => Promise<UserProfileSaveResult>) => {
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;
    setIsPending(true);
    setErrorMessage(undefined);
    try {
      const { error } = await action();
      setErrorMessage(formErrorOf(error)?.message);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      inFlight.current = false;
      setIsPending(false);
    }
  };

  return {
    onChange: onChange ? file => run(() => onChange(file)) : undefined,
    onRemove: onRemove ? () => run(onRemove) : undefined,
    isPending,
    errorMessage,
  };
}
