import type { MouseEventHandler } from 'react';
import { useRef, useState } from 'react';

import { useForm } from '../../components/form';
import { useNow } from '../../hooks/use-now';
import { useLocale } from '../../localization';
import { formatDate } from '../../utils/format-date';
import { getExpirationDate } from './api-keys-table.format';
import type { APIKeysTableMessages } from './api-keys-table.types';
import type { CreateAPIKeyDialogProps, CreateAPIKeyValues } from './create-api-key.dialog';

const initialValues: CreateAPIKeyValues = { name: '', description: '', expiration: null };

export interface CreateAPIKeyInput {
  name: string;
  description: string | undefined;
  expiresAt: Date | null;
}

export interface CreateAPIKeyControllerOptions {
  messages: APIKeysTableMessages;
  showDescription: boolean;
  onCreate: (input: CreateAPIKeyInput) => Promise<string>;
}

export interface CreateAPIKeyController {
  onOpen: MouseEventHandler<HTMLButtonElement>;
  dialog: CreateAPIKeyDialogProps;
}

export function useCreateAPIKeyController({
  messages,
  showDescription,
  onCreate,
}: CreateAPIKeyControllerOptions): CreateAPIKeyController {
  const locale = useLocale();
  const now = useNow({ updateInterval: 60_000 });
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [hasTriedCopy, setHasTriedCopy] = useState(false);

  const form = useForm({
    initialValues,
    errorFallback: messages.createError,
    canSubmit: values => values.name.trim().length > 2 && values.expiration !== null,
    onSubmit: async ({ name, description, expiration }) => {
      if (expiration === null) {
        return;
      }
      return onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        expiresAt: getExpirationDate(expiration, new Date()),
      });
    },
    onSuccess: secret => {
      if (secret !== undefined) {
        setSecret(secret);
      }
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
      setHasTriedCopy(false);
      setOpen(true);
    },
    dialog: {
      messages,
      open,
      onOpenChange: next => {
        if (!form.isSubmitting && (secret === null || hasTriedCopy)) {
          setOpen(next);
        }
      },
      finalFocus: trigger,
      form,
      showDescription,
      expirationDateLabel: expirationDate ? formatDate(expirationDate, locale) : null,
      secret,
      copyError,
      onCopy: async close => {
        try {
          await navigator.clipboard.writeText(secret ?? '');
        } catch (error) {
          setHasTriedCopy(true);
          setCopyError(messages.copyError);
          if (!close) {
            throw error;
          }
          return;
        }
        setHasTriedCopy(true);
        setCopyError(null);
        if (close) {
          setOpen(false);
        }
      },
    },
  };
}
