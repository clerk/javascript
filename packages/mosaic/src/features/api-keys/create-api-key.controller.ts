import type { MouseEventHandler } from 'react';
import { useRef } from 'react';

import { useForm } from '../../components/form';
import { useNow } from '../../hooks/use-now';
import { useLocale } from '../../localization';
import { setup } from '../../machine/setup';
import { useMachine } from '../../machine/use-machine';
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

interface Context {
  secret: string | null;
  copyFailed: boolean;
}

type Event =
  | { type: 'OPEN' }
  | { type: 'CREATED'; secret: string }
  | { type: 'COPY' }
  | { type: 'COPIED' }
  | { type: 'COPY_FAILED' }
  | { type: 'CLOSE' };

const { createMachine } = setup<Context, Event>();

const machine = createMachine({
  id: 'createAPIKey',
  initial: 'closed',
  context: { secret: null, copyFailed: false },
  states: {
    closed: {
      on: { OPEN: () => ({ target: 'form', context: { secret: null, copyFailed: false } }) },
    },
    form: {
      on: {
        CREATED: ({ event }) => ({ target: 'secret', context: { secret: event.secret } }),
        CLOSE: { target: 'closed' },
      },
    },
    secret: {
      on: { COPY: { target: 'copying' } },
    },
    copying: {
      on: {
        COPIED: () => ({ target: 'attempted', context: { copyFailed: false } }),
        COPY_FAILED: () => ({ target: 'attempted', context: { copyFailed: true } }),
      },
    },
    attempted: {
      on: {
        COPY: { target: 'copying' },
        COPIED: () => ({ target: 'attempted', context: { copyFailed: false } }),
        COPY_FAILED: () => ({ target: 'attempted', context: { copyFailed: true } }),
        CLOSE: { target: 'closed' },
      },
    },
  },
});

export function useCreateAPIKeyController({
  messages,
  showDescription,
  onCreate,
}: CreateAPIKeyControllerOptions): CreateAPIKeyController {
  const locale = useLocale();
  const now = useNow({ updateInterval: 60_000 });
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [snapshot, send] = useMachine(machine);
  const { secret, copyFailed } = snapshot.context;

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
        send({ type: 'CREATED', secret });
      }
    },
  });

  const { expiration } = form.values;
  const expirationDate = expiration === null ? null : getExpirationDate(expiration, now);

  return {
    onOpen: event => {
      trigger.current = event.currentTarget;
      form.reset();
      send({ type: 'OPEN' });
    },
    dialog: {
      messages,
      open: snapshot.value !== 'closed',
      onOpenChange: next => {
        if (!next && !form.isSubmitting) {
          send({ type: 'CLOSE' });
        }
      },
      finalFocus: trigger,
      form,
      showDescription,
      expirationDateLabel: expirationDate ? formatDate(expirationDate, locale) : null,
      secret,
      copyError: copyFailed ? messages.copyError : null,
      onCopy: async close => {
        send({ type: 'COPY' });
        try {
          await navigator.clipboard.writeText(secret ?? '');
        } catch (error) {
          send({ type: 'COPY_FAILED' });
          if (!close) {
            throw error;
          }
          return;
        }
        send({ type: 'COPIED' });
        if (close) {
          send({ type: 'CLOSE' });
        }
      },
    },
  };
}
