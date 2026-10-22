import { useSuspenseProfile } from '@clerk/loom/react';

import { FormSubmitError } from '../../components/form';
import { useReverificationFlow } from '../../features/reverification';
import type { UserProfilePasskeysModel } from '../../features/user-profile/user-profile-passkeys-section/user-profile-passkeys-section.model';
import type { UserProfilePasskey } from '../../features/user-profile/user-profile-passkeys-section/user-profile-passkeys-section.types';
import { fill, useLocale, useMessages } from '../../localization';
import { save, SaveError } from '../../utils/errors';

type ReadyModel = Extract<UserProfilePasskeysModel, { status: 'ready' }>;

export type LoomPasskeysState =
  | { kind: 'snapshot'; passkeys: UserProfilePasskey[]; addEligible: boolean }
  | { kind: 'interactive'; model: ReadyModel };

export function useLoomProfilePasskeysModel(): LoomPasskeysState | null {
  const { scope, user, settings, actions } = useSuspenseProfile();
  const locale = useLocale();
  const messages = useMessages('userProfilePasskeys');
  const [removePasskey, reverification] = useReverificationFlow((id: string) => {
    const remove = actions.passkey.remove;
    if (!remove) {
      throw new SaveError({ global: { code: 'passkey_unavailable', message: messages.unavailableError } });
    }
    return remove(id);
  });
  const enabled = Boolean(settings.passkey?.enabled);
  const canAdd =
    !settings.enterpriseSsoEnabled ||
    !user.enterpriseAccounts.some(
      account => account.active && account.enterpriseConnection?.disableAdditionalIdentifications,
    );
  if (!enabled || !canAdd) {
    return null;
  }
  if (!user.passkeys) {
    throw new Error('Loom passkey data is unavailable.');
  }
  const formatDate = (timestamp: number): string => {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(timestamp));
  };
  const passkeys = user.passkeys.map(passkey => ({
    id: passkey.id,
    name: passkey.name,
    createdAtLabel: fill(messages.createdAt, { date: formatDate(passkey.createdAt) }),
    lastUsedAtLabel: passkey.lastUsedAt
      ? fill(messages.lastUsedAt, { date: formatDate(passkey.lastUsedAt) })
      : undefined,
  }));
  if (!actions.passkey.available || !actions.passkey.rename || !actions.passkey.remove) {
    return { kind: 'snapshot', passkeys, addEligible: canAdd };
  }
  const validateName: ReadyModel['validateName'] = name =>
    new TextEncoder().encode(name).length > 256 ? { type: 'error', message: messages.nameTooLongError } : undefined;
  const add = actions.passkey.add;
  return {
    kind: 'interactive',
    model: {
      status: 'ready',
      userId: user.id,
      sessionId: scope.sessionId,
      passkeys,
      validateName,
      onAdd: add ? () => save(add) : undefined,
      onRename: async (id, name) => {
        const feedback = validateName(name);
        if (feedback) {
          throw new FormSubmitError({ fields: { name: feedback.message } });
        }
        const rename = actions.passkey.rename;
        if (!rename) {
          throw new FormSubmitError({ message: messages.unavailableError });
        }
        await save(() => rename(id, name), ['name']);
      },
      onRemove: id => save(() => removePasskey(id)),
      reverification,
    },
  };
}
