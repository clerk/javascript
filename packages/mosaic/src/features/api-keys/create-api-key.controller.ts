import type { MouseEventHandler } from 'react';
import { useRef, useState } from 'react';

import { useForm } from '../../components/form';
import { useNow } from '../../hooks/use-now';
import { useLocale } from '../../localization';
import { formatDate, getExpirationDate } from './api-keys-table.format';
import type { APIKeysTableMessages } from './api-keys-table.types';
import type { CreateAPIKeyDialogProps, CreateAPIKeyValues } from './create-api-key.dialog';

const initialValues: CreateAPIKeyValues = { name: '', expiration: null };

export interface CreateAPIKeyInput {
  name: string;
  expiresAt: Date | null;
}

export interface CreateAPIKeyControllerOptions {
  messages: APIKeysTableMessages;
  onCreate: (input: CreateAPIKeyInput) => Promise<string>;
}

export interface CreateAPIKeyController {
  onOpen: MouseEventHandler<HTMLButtonElement>;
  dialog: CreateAPIKeyDialogProps;
}

export function useCreateAPIKeyController({
  messages,
  onCreate,
}: CreateAPIKeyControllerOptions): CreateAPIKeyController {
  const locale = useLocale();
  const now = useNow({ updateInterval: 60_000 });
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  const form = useForm({
    initialValues,
    errorFallback: messages.createError,
    canSubmit: values => values.name.trim().length > 2 && values.expiration !== null,
    onSubmit: async ({ name, expiration }) => {
      if (expiration === null) {
        return;
      }
      setSecret(await onCreate({ name: name.trim(), expiresAt: getExpirationDate(expiration, new Date()) }));
    },
  });

  const { expiration } = form.values;
  const expirationDate = expiration === null ? null : getExpirationDate(expiration, now);

  return {
    onOpen: event => {
      trigger.current = event.currentTarget;
      form.reset();
      setSecret(null);
      setCopyError(null);
      setOpen(true);
    },
    dialog: {
      messages,
      open,
      onOpenChange: next => {
        if (!form.isSubmitting) {
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
          setCopyError(messages.copyError);
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
