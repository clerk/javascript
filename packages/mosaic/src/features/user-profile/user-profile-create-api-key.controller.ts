import type { MouseEventHandler } from 'react';
import { useRef, useState } from 'react';

import { useForm } from '../../components/form';
import { useLocale, useMessages } from '../../localization';
import { formatDate, getExpirationDate } from './user-profile-api-keys.format';
import type {
  UserProfileCreateAPIKeyDialogProps,
  UserProfileCreateAPIKeyValues,
} from './user-profile-create-api-key.dialog';

const initialValues: UserProfileCreateAPIKeyValues = { name: '', expiration: null };

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
  const [secret, setSecret] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  const form = useForm({
    initialValues,
    canSubmit: values => values.name.trim().length > 2 && values.expiration !== null,
    onSubmit: async ({ name, expiration }) => {
      if (expiration === null) {
        return;
      }
      setSecret(await onCreate({ name: name.trim(), expiresAt: getExpirationDate(expiration, new Date()) }));
    },
  });

  const { expiration } = form.values;
  const expirationDate = expiration === null ? null : getExpirationDate(expiration, new Date());

  return {
    onOpen: event => {
      trigger.current = event.currentTarget;
      form.reset();
      setSecret(null);
      setCopyError(null);
      setOpen(true);
    },
    dialog: {
      open,
      onOpenChange: next => {
        if (!form.isSubmitting && (secret === null || copyError !== null)) {
          setOpen(next);
        }
      },
      finalFocus: trigger,
      form,
      expirationDateLabel: expirationDate ? formatDate(expirationDate, locale) : null,
      secret,
      copyError,
      onCopy: async close => {
        try {
          await navigator.clipboard.writeText(secret ?? '');
        } catch (error) {
          setCopyError(m.copyError);
          if (!close) {
            throw error;
          }
          return;
        }
        setCopyError(null);
        if (close) {
          setOpen(false);
        }
      },
    },
  };
}
