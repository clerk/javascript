import { useRef, useState } from 'react';

import type { UserProfileContact } from './user-profile-account-section.types';

export interface UserProfileSetPrimaryControllerOptions {
  items: UserProfileContact[];
  onSetPrimary?: (id: string) => void | Promise<void>;
  fallbackError: string;
}

export interface UserProfileSetPrimaryController {
  onSetPrimary: ((id: string) => void) | undefined;
  error: string | undefined;
}

export function useUserProfileSetPrimaryController({
  items,
  onSetPrimary,
  fallbackError,
}: UserProfileSetPrimaryControllerOptions): UserProfileSetPrimaryController {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string>();
  const pending = useRef(false);

  const setPrimary = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (!onSetPrimary || !item?.isVerified || item.isDefault || pending.current) {
      return;
    }
    pending.current = true;
    setIsPending(true);
    setError(undefined);
    try {
      await onSetPrimary(id);
    } catch (error) {
      setError(error instanceof Error ? error.message : fallbackError);
    } finally {
      pending.current = false;
      setIsPending(false);
    }
  };

  return {
    onSetPrimary: onSetPrimary && !isPending ? id => void setPrimary(id) : undefined,
    error,
  };
}
