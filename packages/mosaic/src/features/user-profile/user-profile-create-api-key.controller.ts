import type { MouseEventHandler } from 'react';
import { useRef, useState } from 'react';

import { useLocale, useMessages } from '../../localization';
import { formatDate, getExpirationDate } from './user-profile-api-keys.format';
import type {
  UserProfileAPIKeyExpiration,
  UserProfileCreateAPIKeyDialogProps,
} from './user-profile-create-api-key.dialog';

export interface UserProfileCreateAPIKeyInput {
  name: string;
  expiresAt: Date | null;
}

export interface UserProfileCreateAPIKeyControllerOptions {
  onCreate: (input: UserProfileCreateAPIKeyInput) => Promise<string>;
}

export interface UserProfileCreateAPIKeyController {
  onOpen: MouseEventHandler<HTMLButtonElement>;
  dialog: UserProfileCreateAPIKeyDialogProps;
}

export function useUserProfileCreateAPIKeyController({
  onCreate,
}: UserProfileCreateAPIKeyControllerOptions): UserProfileCreateAPIKeyController {
  const m = useMessages('userProfileApiKeysPanel');
  const locale = useLocale();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [expiration, setExpiration] = useState<UserProfileAPIKeyExpiration | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const expirationDate = expiration === null ? null : getExpirationDate(expiration, new Date());

  return {
    onOpen: event => {
      trigger.current = event.currentTarget;
      setName('');
      setExpiration(null);
      setSecret(null);
      setError(null);
      setOpen(true);
    },
    dialog: {
      open,
      onOpenChange: setOpen,
      finalFocus: trigger,
      name,
      onNameChange: setName,
      expiration,
      expirationDateLabel: expirationDate ? formatDate(expirationDate, locale) : null,
      onExpirationChange: setExpiration,
      secret,
      isPending,
      error,
      onSubmit: async () => {
        if (expiration === null) {
          return;
        }
        setIsPending(true);
        setError(null);
        try {
          setSecret(await onCreate({ name: name.trim(), expiresAt: getExpirationDate(expiration, new Date()) }));
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : m.createError);
        } finally {
          setIsPending(false);
        }
      },
      onCopy: async close => {
        if (!close) {
          return;
        }
        try {
          await navigator.clipboard.writeText(secret ?? '');
          setOpen(false);
        } catch {
          setError(m.copyError);
        }
      },
    },
  };
}
