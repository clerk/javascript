import { useProfileSnapshot } from '@clerk/loom/handoff';

import type { UserProfilePasskey } from '../../features/user-profile/user-profile-passkeys-section/user-profile-passkeys-section.types';
import { fill, useLocale, useMessages } from '../../localization';

export type LoomPasskeysState = { passkeys: UserProfilePasskey[]; addEligible: boolean };

export function useLoomProfilePasskeysModel(): LoomPasskeysState | null {
  const { user, settings } = useProfileSnapshot();
  const locale = useLocale();
  const messages = useMessages('userProfilePasskeys');
  const canAdd = !settings.enterpriseSsoEnabled || !user.enterpriseAccounts.some(
    account => account.active && account.enterpriseConnection?.disableAdditionalIdentifications,
  );
  if (!settings.passkey?.enabled || !canAdd) {
    return null;
  }
  if (!user.passkeys) {
    throw new Error('Loom passkey data is unavailable.');
  }
  const formatDate = (timestamp: number): string =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(timestamp));
  return {
    passkeys: user.passkeys.map(passkey => ({
      id: passkey.id,
      name: passkey.name,
      createdAtLabel: fill(messages.createdAt, { date: formatDate(passkey.createdAt) }),
      lastUsedAtLabel: passkey.lastUsedAt
        ? fill(messages.lastUsedAt, { date: formatDate(passkey.lastUsedAt) })
        : undefined,
    })),
    addEligible: canAdd,
  };
}
